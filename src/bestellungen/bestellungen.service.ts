import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDto } from 'src/dto/order.dto';
import { Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Repository } from 'typeorm';

@Injectable()
export class BestellungenService {
    constructor(@InjectRepository(Bestellung) private readonly bestellungRepository: Repository<Bestellung>,
    @InjectRepository(ProduktInBestellung) private readonly productRepository: Repository<ProduktInBestellung>) {}

    async createBestellung(bestellungData: OrderDto): Promise<Bestellung> {
        try {
          const bestellung = this.bestellungRepository.create(bestellungData);
          return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          throw new HttpException('Error creating bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async getBestellung(id: number): Promise<Bestellung> {
        try {
          return await this.bestellungRepository.findOne({ where: { id: id }});
        } catch (error) {
          throw new HttpException('Error retrieving bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async updateBestellung(id: number, bestellungData: OrderDto): Promise<Bestellung> {
        try {
          const bestellung = await this.bestellungRepository.findOne({ where: { id: id }});
          if (!bestellung) {
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
          }
          this.bestellungRepository.merge(bestellung, bestellungData);
          return await this.bestellungRepository.save(bestellung);
        } catch (error) {
          throw new HttpException('Error updating bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async deleteBestellung(id: number): Promise<void> {
        try {
          const bestellung = await this.bestellungRepository.findOne({ where: { id: id }});
          if (!bestellung) {
            throw new HttpException('Bestellung not found', HttpStatus.NOT_FOUND);
          }
          await this.bestellungRepository.remove(bestellung);
        } catch (error) {
          throw new HttpException('Error deleting bestellung', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
}
