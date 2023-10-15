import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProduktVariations } from 'src/entity/produktVariations';
import { Repository } from 'typeorm';

@Injectable()
export class VariationService {
    constructor(
        @InjectRepository(ProduktVariations)
        private produktVariationsRepository: Repository<ProduktVariations>,
    ) {}

    async findAll() {
        try {
            return await this.produktVariationsRepository.find();
        } catch (err) {
            return err;
        }
       
    }

    async findByVariationsName(variations_name: string) {
        try {
            return await this.produktVariationsRepository.find({ where: { 
                variations_name: variations_name
            }});
        } catch (err) {
            return err;
        }
      
    }

    async findOne(sku: string) {
        try {
            return await this.produktVariationsRepository.findOne({ where: {
                sku: sku
            }});
        } catch (err) {
            return err;
        }
 
    }

    async create(produktVariations: ProduktVariations) {
        try {
            return await this.produktVariationsRepository.save(produktVariations);
        } catch (err) {

        }
       
    }

    async delete(sku: string) {
        try {
            return await this.produktVariationsRepository.delete(sku);
        } catch (err) {
            return err;
        }
      
    }

    async update(sku: string, produktVariations: Partial<ProduktVariations>) {
        try {
            return await this.produktVariationsRepository.update(sku, produktVariations);
        } catch (err) {
            return err;
        }
       
    }
}
