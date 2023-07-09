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
          console.log(lieferant)
            const item: Partial<Lieferant> = await this.lieferantRepository.create(lieferant); 
            console.log(item);
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
            const alt = await this.lieferantRepository.findOne({where: {id: lieferant.id}, relations: { adresse: true }});
            const newItem = await this.lieferantRepository.merge(alt, item);
                
                return await this.lieferantRepository.save(newItem);
        } catch (error) {
          throw error;
        }
      }
    
      async delete(id: number): Promise<number> {
        try {
          const alt = await this.lieferantRepository.findOne({where: {id: id}, relations: { adresse: true }});
        
          const del = await (await this.lieferantRepository.delete(id)).affected;
          if(del === 1) {
            await this.lieferantRepository.query('DELETE FROM address_kunde WHERE ID='+alt.adresse.id);
            return del;
          }
      

          throw new HttpException('Etwas ist schiefgelaufen, liferant wurde nicht gelöscht', HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (error) {
          throw error;
        }
      }
}
