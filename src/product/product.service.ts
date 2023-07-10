import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Produkt)
        private produktRepository: Repository<Produkt>,
      ) {}
    
      async getAllProdukte(): Promise<Produkt[]> {
        try {
          return await this.produktRepository.find();
        } catch (error) {
          throw new HttpException('Error while retrieving products', HttpStatus.NOT_FOUND);
        }
      }
    
      async getProduktById(id: number): Promise<Produkt> {
        try {
          return await this.produktRepository.findOne({where: { id: id }, relations: {
            bestellungen: true,
            lieferant: true,
            kategorie: true,
            warenausgang: true,
            wareneingang: true,
            promocje: true,
            reservation: true,
            bewertung: true,
          }});
        } catch (error) {
        throw new HttpException('Error while retrieving products', HttpStatus.NOT_FOUND);
        }
      }
    
      async createProdukt(productDto: ProductDto): Promise<Produkt> {
        try {
          const produkt = await this.produktRepository.create(productDto);
          return await this.produktRepository.save(produkt);
        } catch (error) {
         
          throw new HttpException('Error while creating product', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
    
      async updateProdukt(id: number, productDto: ProductDto): Promise<Produkt> {
        try {
          const produkt = await this.produktRepository.findOne({where: { id: id }});
          if (!produkt) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
          }
        await this.produktRepository.merge(produkt, productDto);
          return await this.produktRepository.save(produkt);
        } catch (error) {
          throw error;
        }
      }
    
      async deleteProdukt(id: number): Promise<void> {
        try {
          await this.produktRepository.delete(id);
        } catch (error) {
          throw new Error('Error while deleting product');
        }
      }
}
