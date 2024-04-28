import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Destruction_protocolDTO } from 'src/dto/destruction_protocol.dto';
import { Destruction_protocolEntity } from 'src/entity/destruction_protocolEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import {  DeleteResult, Repository } from 'typeorm';


@Injectable()
export class DestructionProService {
    constructor(@InjectRepository(Destruction_protocolEntity) private readonly service: Repository<Destruction_protocolEntity>) {}
    async getProtocols(sitenr: number, itemProSite: number): Promise<[Destruction_protocolEntity[], number]> {
        const skip = sitenr * itemProSite - itemProSite > 0 ? sitenr * itemProSite - itemProSite : 0;
        try {
            return await this.service.findAndCount({
                take: itemProSite,
                skip: skip
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

                if(!variation)
                    throw new Error('Produkt Variation not found!')

                if(variation.quanity - prot.quantity < 0)
                    throw new Error('Produkt Quantity after -  willbe smaller then 0!')

                variation.quanity -= prot.quantity;

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

            item.quanity += prot.quantity;
            await manager.save(ProduktVariations, item);

            const delRes: DeleteResult = await manager.delete(DestructionProService, { id: id });
            if(delRes.affected !== 1)
                throw new Error('Protocol cannot be deleted.... ')    

            return delRes.affected;
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

                if (oldProt.quantity !== prot.quantity) {
                    if(prot.quantity > oldProt.quantity && variation.quanity - (prot.quantity - oldProt.quantity) >= 0)
                        variation.quanity -= prot.quantity - oldProt.quantity;

                    if(prot.quantity < oldProt.quantity)
                        variation.quanity += oldProt.quantity - prot.quantity;
                        
                }

                if(oldProt.quantity !== prot.quantity && variation.quanity < 0)
                    throw new Error('Produkt Quantity after -  willbe smaller then 0!')

                const merged = await manager.merge(Destruction_protocolEntity, prot, oldProt);

                await manager.save(ProduktVariations, variation);

                return await manager.save(Destruction_protocolEntity, merged);

            })

        } catch (err) {
            throw err;
        }
    }
}
