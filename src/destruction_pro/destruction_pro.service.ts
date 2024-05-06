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
                    throw new Error('Produkt Variation not found!')
                //only for local update, when at once we sell more then 1 item
                prot.quantity = protocol.quantity * variation.quanity_sold_at_once;
                prot.quantity_at_once = variation.quanity_sold_at_once;

                if(variation.quanity - prot.quantity < 0)
                    throw new Error('Produkt Quantity after -  willbe smaller then 0!')

                variation.quanity -= prot.quantity;
                let do_update = { update: '', menge: 0, item: 'saved' };
                if(product.ebay === 1) {
                    // on ebay 1 item is 1 item,
                    do_update = await updateEbayOffer(prot.variationId, protocol.quantity, 3, null, this.offerService, this.logsService);
                }
                    

                if(product.ebay === 1 && do_update.item !== 'saved')
                    throw new Error(do_update.item)

                await manager.save(ProduktVariations, variation);

                return await manager.save(Destruction_protocolEntity, prot);   
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

          return await this.service.manager.transaction(async (manager) => {
            const prot = await manager.findOne(Destruction_protocolEntity, { where: {
                id: id
            }})

            if (!prot)
                throw new Error('Protocol not found!')

            const item = await manager.findOne(ProduktVariations, { where : {
                sku: prot.variationId
            }})
            if (!item)
                throw new Error('Produkt Varation not found!')

            
            const product = await manager.findOne(Produkt, {where: {
                id: prot.produktId
            }});

            if(!product)
                throw new Error('Produkt not found!')

            item.quanity += prot.quantity;

            let do_update = { update: '', menge: 0, item: 'saved' };
            if(product.ebay === 1)
                do_update = await updateEbayOffer(prot.variationId, -(prot.quantity / item.quanity_sold_at_once), 3, null, this.offerService, this.logsService);

            if(product.ebay === 1 && do_update.item !== 'saved')
                throw new Error(do_update.item)
            
            await manager.save(ProduktVariations, item);

            const delRes: DeleteResult = await manager.delete(DestructionProService, { id: id });
            if(delRes.affected !== 1)
                throw new Error('Protocol cannot be deleted.... ')    

          
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
                    throw new Error('Produkt Variation not found!')

                const oldProt = await manager.findOne(Destruction_protocolEntity,{ where: {
                    id: prot.id
                }});

                if(!oldProt)
                    throw new Error('Protocol not found!')

                
                const product = await manager.findOne(Produkt, {where: {
                    id: protocol.produktId
                }});

                if(!product)
                    throw new Error('Produkt not found!')

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
                    throw new Error('Produkt Quantity after -  willbe smaller then 0!')

                if( eby_quantity !== 0) {
                    let do_update = { update: '', menge: 0, item: 'saved' };
                    if(product.ebay === 1)
                        do_update = await updateEbayOffer(prot.variationId,  eby_quantity / variation.quanity_sold_at_once, 3, null, this.offerService, this.logsService);
        
                    if(product.ebay === 1 && do_update.item !== 'saved')
                        throw new Error(do_update.item)
                }
           

                const merged = await manager.merge(Destruction_protocolEntity, oldProt, prot);

                await manager.save(ProduktVariations, variation);

                return await manager.save(Destruction_protocolEntity, merged);

            })

        } catch (err) {
            throw err;
        }
    }
}
