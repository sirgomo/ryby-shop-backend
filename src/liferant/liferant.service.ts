import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LieferantDto } from 'src/dto/liferant.dto';
import { Lieferant } from 'src/entity/lifernatEntity';
import { Repository } from 'typeorm';

@Injectable()
export class LiferantService {
    constructor(
        @InjectRepository(Lieferant)
        private lieferantRepository: Repository<Lieferant>,
      ) {}
    
      async findAll(): Promise<Lieferant[]> {
        try {
          return await this.lieferantRepository.find();
        } catch (error) {
          throw error;
        }
      }
    
      async findById(id: number): Promise<Lieferant> {
        try {
          return await this.lieferantRepository.findOne({where: {id: id }, relations: { adresse: true}});
        } catch (error) {
          throw error;
        }
      }
    
      async create(lieferant: LieferantDto): Promise<Lieferant> {
        try {
            const item: Partial<Lieferant> = await this.lieferantRepository.create(lieferant); 
          return await this.lieferantRepository.save(item);
        } catch (error) {
          throw error;
        }
      }
    
      async update(lieferant: LieferantDto): Promise<Lieferant> {
        try {
            const item: Partial<Lieferant> = await this.lieferantRepository.create(lieferant); 
            if(!isFinite(lieferant.id) || lieferant.id === null || lieferant.id === undefined)
                throw new HttpException('Etaws ist schiefgegangen, der liferant konnte nicht gespeichert werden', HttpStatus.BAD_REQUEST);
            
                return await this.lieferantRepository.save(item);
        } catch (error) {
          throw error;
        }
      }
    
      async delete(id: number): Promise<number> {
        try {
         return  (await this.lieferantRepository.delete(id)).affected;
        } catch (error) {
          throw error;
        }
      }
}
