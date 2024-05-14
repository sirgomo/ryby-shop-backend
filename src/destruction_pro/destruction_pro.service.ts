import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { updateEbayOffer } from 'src/bestellungen/ebay_functions';
import { Destruction_protocolDTO } from 'src/dto/destruction_protocol.dto';
import { EbayOffersService } from 'src/ebay/ebay-offers/ebay-offers.service';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { Destruction_protocolEntity } from 'src/entity/destruction_protocolEntity';
import { Produkt } from 'src/entity/produktEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import {  DeleteResult, Repository } from 'typeorm';



@Injectable()
export class DestructionProService {
    
    constructor(@InjectRepository(Destruction_protocolEntity) private readonly service: Repository<Destruction_protocolEntity>,
    private readonly offerService: EbayOffersService, private readonly logsService: LogsService,) {}
    async getProtocols(sitenr: number, itemProSite: number): Promise<[Destruction_protocolEntity[], number]> {
        const skip = sitenr * itemProSite - itemProSite > 0 ? sitenr * itemProSite - itemProSite : 0;
        try {
            return await this.service.findAndCount({
                take: itemProSite,
                skip: skip,
                select: {
                  id: true,
                  produkt_name: true,
                  quantity: true,
                  quantity_at_once: true,
                  type: true,
                  responsible_person: true,
                  destruction_date: true,
                  status: true,
                }
            });
        } catch (err) {
            throw err;
        }
    }
    async createProtocol(protocol: Destruction_protocolDTO) {
        try {
            const prot: Destruction_protocolEntity = await this.service.create(protocol);
            

           return await this.service.manager.transaction(async (manager) => {
                const variation: ProduktVariations = await manager.findOne(ProduktVariations, { where:  {
                    sku: prot.variationId
                }});

                const product = await manager.findOne(Produkt, {where: {
                    id: protocol.produktId
                }});

                if(!product)
                    throw new HttpException('Produkt not found!', HttpStatus.NOT_FOUND);

                if(!variation)
                  throw new HttpException('Produkt Variation not found!', HttpStatus.NOT_FOUND);
                   
                //only for local update, when at once we sell more then 1 item
                prot.quantity = protocol.quantity * variation.quanity_sold_at_once;
                prot.quantity_at_once = variation.quanity_sold_at_once;

                if(variation.quanity - prot.quantity < 0)
                    throw new HttpException('Produkt Quantity after -  willbe smaller then 0!', HttpStatus.FAILED_DEPENDENCY)

                variation.quanity -= prot.quantity;
                
   

                await manager.save(ProduktVariations, variation);

                const protSave =  await manager.save(Destruction_protocolEntity, prot);   
                let do_update = { update: '', menge: 0, item: 'saved' };
                if(product.ebay === 1) {
                  // on ebay 1 item is 1 item,
                  do_update = await updateEbayOffer(prot.variationId, protocol.quantity, 3, null, this.offerService, this.logsService);
                }
                  

                if(product.ebay === 1 && do_update.item !== 'saved')
                  throw new Error(do_update.item)

                return protSave;
            })

        } catch (err) {
            throw err;
        }
    }
    async getProtocById(id: number) {
        try {
            return await this.service.findOne({ where:  { id: id }});
        } catch (err) {
            throw err;
        }
    }
    async deleteProtocolById(id: number) {
        try {
          
          const prot = await this.service.findOne( {
             where: {
            id: id
          }})

          if (!prot)
            throw new HttpException('Protocol not found!', HttpStatus.NOT_FOUND)
          
          return await this.service.manager.transaction(async (manager) => {
        

            const item = await manager.findOne(ProduktVariations, { where : {
                sku: prot.variationId
            }})
            if (!item)
                throw new HttpException('Produkt Varation not found!', HttpStatus.NOT_FOUND)

            
            const product = await manager.findOne(Produkt, {where: {
                id: prot.produktId
            }});

            if(!product)
                throw new HttpException('Produkt not found!', HttpStatus.NOT_FOUND)

            item.quanity += prot.quantity;

            
            
            await manager.save(ProduktVariations, item);
            
            const delRes : DeleteResult = await manager.delete(Destruction_protocolEntity, { id: id });
            console.log(delRes)
            if(delRes.affected !== 1)
                throw new HttpException('Protocol cannot be deleted.... ', HttpStatus.CONFLICT)    
   
            let do_update = { update: '', menge: 0, item: 'saved' };
            if(product.ebay === 1)
              do_update = await updateEbayOffer(prot.variationId, -(prot.quantity / item.quanity_sold_at_once), 3, null, this.offerService, this.logsService);

            console.log(do_update)
            if(product.ebay === 1 && do_update.item !== 'saved')
              throw new Error(do_update.item)

            return delRes;
            })
        } catch (err) {
            throw err;
        }
    }

    async editProtocol(protocol: Destruction_protocolDTO) {
        try {
            const prot: Destruction_protocolEntity = await this.service.create(protocol);

           return await this.service.manager.transaction(async (manager) => {
                const variation: ProduktVariations = await manager.findOne(ProduktVariations, { where:  {
                    sku: prot.variationId
                }});

                if(!variation)
                    throw new HttpException('Produkt Variation not found!', HttpStatus.NOT_FOUND)

                const oldProt = await manager.findOne(Destruction_protocolEntity,{ where: {
                    id: prot.id
                }});

                if(!oldProt)
                    throw new HttpException('Protocol not found!', HttpStatus.NOT_FOUND)

                
                const product = await manager.findOne(Produkt, {where: {
                    id: protocol.produktId
                }});

                if(!product)
                    throw new HttpException('Produkt not found!', HttpStatus.NOT_FOUND)

                prot.quantity = protocol.quantity * variation.quanity_sold_at_once;
                let eby_quantity = 0;
                if (oldProt.quantity !== prot.quantity) {
                    if(prot.quantity > oldProt.quantity && variation.quanity - (prot.quantity - oldProt.quantity) >= 0){
                        variation.quanity -= prot.quantity - oldProt.quantity;
                        eby_quantity = prot.quantity - oldProt.quantity;
                    }
                        

                    if(prot.quantity < oldProt.quantity) {
                        variation.quanity += oldProt.quantity - prot.quantity;
                        eby_quantity = -(oldProt.quantity - prot.quantity);
                    }
                        
                        
                }

                if(oldProt.quantity !== prot.quantity && variation.quanity < 0)
                    throw new HttpException('Produkt Quantity after -  willbe smaller then 0!', HttpStatus.FAILED_DEPENDENCY)

       
           
                prot.id = Number(prot.id);
                const merged = await manager.merge(Destruction_protocolEntity, oldProt, prot);
      
                await manager.save(ProduktVariations, variation);
               
                const mergedAndSaved = await manager.save(Destruction_protocolEntity, merged);
            
                if( eby_quantity !== 0) {
                  let do_update = { update: '', menge: 0, item: 'saved' };
                  if(product.ebay === 1)
                      do_update = await updateEbayOffer(prot.variationId,  eby_quantity / variation.quanity_sold_at_once, 3, null, this.offerService, this.logsService);
      
                  if(product.ebay === 1 && do_update.item !== 'saved')
                      throw new Error(do_update.item)
              }

              return mergedAndSaved;

            })

        } catch (err) {
            throw err;
        }
    }
}
