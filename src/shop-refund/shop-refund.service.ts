import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateAccessToken, handleResponse } from 'src/bestellungen/bestellungen.service';
import { Product_RuckgabeDto } from 'src/dto/product_ruckgabe.dto';
import { ProduktRueckgabe, RUECKGABESTATUS } from 'src/entity/productRuckgabeEntity';
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
          const refund = this.refundRepository.create(refundDto);
                
         const accessToken  = await generateAccessToken();

         const body = JSON.stringify({ 
         "amount": { "value": refundDto.amount, "currency_code": "EUR" },
         "invoice_id": refundDto.bestellung.id, 
         "note_to_payer": refundDto.rueckgabegrund });

         const url = `${env.PAYPAL_URL}/v2/payments/captures/${refundDto.paypal_refund_id}/refund`;
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

        if(refundDto.rueckgabestatus === RUECKGABESTATUS.FULL_REFUND)
          //save items to data base
        
          return await this.refundRepository.save(refund);
        } catch (error) {
          throw new Error('Failed to create refund.');
        }
      }
    
      async getRefundById(id: number): Promise<ProduktRueckgabe> {
        try {
          return await this.refundRepository.findOne({where: {
            id: id
          }});
        } catch (error) {
          throw new Error('Failed to get refund.');
        }
      }
    
      async updateRefund(id: number, refundDto: Product_RuckgabeDto): Promise<ProduktRueckgabe> {
        try {
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
        try {
          return await this.refundRepository.delete(id);
        } catch (error) {
          throw new Error('Failed to delete refund.');
        }
      }
}
