import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WarenEingangDto } from 'src/dto/warenEingang.dto';
import { WarenEingangProductDto } from 'src/dto/warenEingangProduct.dto';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { WareneingangProduct } from 'src/entity/warenEingangProductEntity';
import { Repository } from 'typeorm';


@Injectable()
export class WarenEingangBuchenService {
  constructor(
    @InjectRepository(Wareneingang)
    private readonly warenEingangRepository: Repository<Wareneingang>,
    @InjectRepository(WareneingangProduct)
    private readonly warenEingangProductRepository: Repository<WareneingangProduct>,
  ) {}

  async findById(id: number): Promise<Wareneingang> {
    try {
      const wareneingang = await this.warenEingangRepository.findOne({ where: { id: id }, relations: { products: true }});
      if (!wareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      return wareneingang;
    } catch (error) {
      throw new NotFoundException('Wareneingang nicht gefunden');
    }
  }

  async create(wareneingangDto: WarenEingangDto): Promise<Wareneingang> {
    try {
      const wareneingang = this.warenEingangRepository.create(wareneingangDto);
      const createdWareneingang = await this.warenEingangRepository.save(wareneingang);
      return createdWareneingang;
    } catch (error) {
      throw new HttpException('Fehler beim Erstellen des Wareneingangs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(wareneingangDto: WarenEingangDto): Promise<Wareneingang> {
    try {
      const foundWareneingang = await this.warenEingangRepository.findOne({ where: { id: wareneingangDto.id }});
      
      if (!foundWareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (foundWareneingang.gebucht) {
        throw new HttpException('Bereits gebuchter Wareneingang kann nicht aktualisiert werden', HttpStatus.BAD_REQUEST);
      }
  
      const merged = await this.warenEingangRepository.merge(foundWareneingang, wareneingangDto);
      const updatedWareneingang = await this.warenEingangRepository.save(merged);
      return updatedWareneingang;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      } else {
        throw new HttpException('Fehler beim Aktualisieren des Wareneingangs', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async delete(id: number): Promise<number> {
    try {
      const foundWareneingang = await this.warenEingangRepository.findOne( { where: { id : id } });
      if (!foundWareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (foundWareneingang.gebucht) {
        throw new HttpException('Bereits gebuchter Wareneingang kann nicht gelöscht werden', HttpStatus.BAD_REQUEST);
      }
     return (await this.warenEingangRepository.delete(id)).affected;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      } else {
        throw new HttpException('Fehler beim Löschen des Wareneingangs', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async addProduct(wareneingangId: number, productDto: WarenEingangProductDto): Promise<WareneingangProduct> {
    try {
      const wareneingang = await this.warenEingangRepository.findOne({ where: { id: wareneingangId }, relations: { products: true }});
      if (!wareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (wareneingang.gebucht) {
        throw new HttpException('Produkt kann nicht zu einem bereits gebuchten Wareneingang hinzugefügt werden', HttpStatus.BAD_REQUEST);
      }
      const product = this.warenEingangProductRepository.create(productDto);
      wareneingang.products.push(product);
      const saved = await this.warenEingangRepository.save(wareneingang);
      return saved.products[saved.products.length -1];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      } else {
        throw new HttpException('Fehler beim Hinzufügen des Produkts', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async updateProduct(wareneingangId: number, productId: number, productDto: WarenEingangProductDto): Promise<WareneingangProduct> {
    try {
      const wareneingang = await this.warenEingangRepository.findOne({ where: { id : wareneingangId }});
      if (!wareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (wareneingang.gebucht) {
        throw new HttpException('Produkt kann nicht in einem bereits gebuchten Wareneingang aktualisiert werden', HttpStatus.BAD_REQUEST);
      }
      const product = await this.warenEingangProductRepository.findOne({where: { id: productId }});
      if (!product) {
        throw new NotFoundException('Produkt nicht gefunden');
      }
      const merged = await this.warenEingangProductRepository.merge(product, productDto);
      return await this.warenEingangProductRepository.save(merged);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      } else {
        throw new HttpException('Fehler beim Aktualisieren des Produkts', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async deleteProduct(wareneingangId: number, productId: number): Promise<number> {
    try {
      const wareneingang = await this.warenEingangRepository.findOne({ where: { id: wareneingangId }, relations: { 
          products: true,
      }});
      if (!wareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (wareneingang.gebucht) {
        throw new HttpException('Produkt kann nicht aus einem bereits gebuchten Wareneingang gelöscht werden', HttpStatus.BAD_REQUEST);
      }
      const product = wareneingang.products.find((product) => product.id === productId);
      if (!product) {
        throw new NotFoundException('Produkt nicht gefunden');
      }
     return (await this.warenEingangProductRepository.delete(productId)).affected;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      } else {
        throw new HttpException('Fehler beim Löschen des Produkts', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}