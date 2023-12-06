import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateAccessToken, handleResponse } from 'src/bestellungen/bestellungen.service';
import { Product_RuckgabeDto } from 'src/dto/product_ruckgabe.dto';
import { ProduktRueckgabe, RUECKGABESTATUS } from 'src/entity/productRuckgabeEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import { env } from 'src/env/env';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class ShopRefundService {
    constructor(
        @InjectRepository(ProduktRueckgabe)
        private readonly refundRepository: Repository<ProduktRueckgabe>,
      ) {}
    
      async createRefund(refundDto: Product_RuckgabeDto): Promise<ProduktRueckgabe> {
        try {
          const refund = await this.refundRepository.create(refundDto);
          if(refundDto.rueckgabestatus === RUECKGABESTATUS.FULL_REFUND) {
            let amount = 0;
            for (let i = 0; i < refundDto.produkte.length; i++) {
                amount += refundDto.produkte[i].verkauf_price;
            }
            refund.amount += amount;
          }
        
          //is paypal transaction ?
         if(refundDto.bestellung.paypal_order_id) {

            const accessToken  = await generateAccessToken();

            const body = JSON.stringify({ 
            "amount": { "value": refund.amount, "currency_code": "EUR" },
            "invoice_id": refundDto.bestellung.id, 
            "note_to_payer": refundDto.rueckgabegrund });


            const url = `${env.PAYPAL_URL}/v2/payments/captures/${refundDto.bestellung.paypal_order_id}/refund`;
            const paypal_refund = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                  'Prefer': 'return=representation'
                },
                body: body,
            })
  
            const response = await handleResponse(paypal_refund);
            if(response.status === 'CANCELLED' || response.status === 'FAILED')
              throw new HttpException('Refund not created', HttpStatus.NOT_ACCEPTABLE);

            refund.paypal_refund_id = response.id;
         }
 

          let savedRefund: ProduktRueckgabe = { id : -1} as ProduktRueckgabe;
          await this.refundRepository.manager.transaction(async (transactionManger) => {
            const variations : ProduktVariations[] = [];
            if(refund.produkte.length > 0) {
                for( let i = 0; i < refund.produkte.length; i++) {
                    const item: ProduktVariations = await transactionManger.findOne(ProduktVariations, {where : { sku: refund.produkte[i].color}});
                    if(item) {
                        item.quanity += refund.produkte[i].menge;
                        item.quanity_sold -= refund.produkte[i].menge;
                        variations.push(item);
                    }
                    
                }
            }
           
            await transactionManger.save(ProduktVariations, variations);
            savedRefund = await transactionManger.save(refund);
          })

          return savedRefund;
        } catch (error) {
          throw new Error('Failed to create refund.');
        }
      }
    
      async getRefundById(id: number): Promise<ProduktRueckgabe> {
        try {

            const item = await this.refundRepository.findOne({where: {
                id: id
              }});
              if(item.paypal_refund_id) {
                const accessToken  = await generateAccessToken();

                const url = `${env.PAYPAL_URL}/v2/payments/refunds/${item.paypal_refund_id}`;
                const paypal_refund = await fetch(url, {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${accessToken}`,
                     
                    },
                
                })
      
                const response = await handleResponse(paypal_refund);
       

                  console.log(response)
            if(response.status !== item.paypal_refund_status)
                item.paypal_refund_status = response.status;

                await this.refundRepository.save(item);
            }

       
        return item;
        } catch (error) {
          throw new Error('Failed to get refund.');
        }
      }
    
      async updateRefund(id: number, refundDto: Product_RuckgabeDto): Promise<ProduktRueckgabe> {
        try {
            throw new HttpException('Refund update not possible', HttpStatus.NOT_ACCEPTABLE)
          const refund = await this.refundRepository.findOne({ where : {
            id: id
            },
            relations: {
                produkte: true,
            }
        });
          if (!refund) {
            throw new Error('Refund not found.');
          }
    
          const updatedRefund = this.refundRepository.merge(refund, refundDto);
          return await this.refundRepository.save(updatedRefund);
        } catch (error) {
          throw new Error('Failed to update refund.');
        }
      }
    
      async deleteRefund(id: number): Promise<DeleteResult> {
        throw new HttpException('Refund delete not possible', HttpStatus.NOT_ACCEPTABLE)
        try {
            const refund = await this.refundRepository.findOne({ where: {
                id: id,
            },
            relations: {
                produkte: true,
            }    
        });

        if(!refund)
            throw new HttpException('Refund not found!', HttpStatus.NOT_ACCEPTABLE);

        let delResult: DeleteResult = { affected: 0 } as DeleteResult;
            await this.refundRepository.manager.transaction(async (transactionManger) => {
                const variations : ProduktVariations[] = [];
                if(refund.produkte.length > 0) {
                    for( let i = 0; i < refund.produkte.length; i++) {
                        const item: ProduktVariations = await transactionManger.findOne(ProduktVariations, {where : { sku: refund.produkte[i].color}});
                        if(item) {
                            item.quanity -= refund.produkte[i].menge;
                            item.quanity_sold += refund.produkte[i].menge;
                            variations.push(item);
                        }
                        
                    }
                }
            await transactionManger.save(ProduktVariations, variations);
           delResult = await transactionManger.delete(ProduktRueckgabe, { id: id})
            });

          return delResult;
        } catch (error) {
          throw new Error('Failed to delete refund.');
        }
      }
}
