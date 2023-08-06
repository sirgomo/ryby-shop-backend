import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColorDto } from 'src/dto/color.dto';

import { WarenEingangDto } from 'src/dto/warenEingang.dto';
import { WarenEingangProductDto } from 'src/dto/warenEingangProduct.dto';
import { Produkt } from 'src/entity/produktEntity';
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
    @InjectRepository(Produkt)
    private readonly prodRepo: Repository<Produkt>
  ) {}
  async getAll(): Promise<Wareneingang[]> {
    try {
      return await this.warenEingangRepository.createQueryBuilder('buchungen')
      .leftJoinAndSelect('buchungen.lieferant', 'lieferant')
      .getMany();
    } catch (err) {
      throw new Error(err.message);
    }
    
  }
  async findById(id: number): Promise<Wareneingang> {
    try {
      const wareneingang = await this.warenEingangRepository.findOne({ 
        
        where: { id: id }, 
        relations: {
          products: { produkt: true },
          lieferant: true,
        }
    }).catch((err) => {
      console.log(err)
    });
   
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
      const wareneingang = await this.warenEingangRepository.create(wareneingangDto);
      const createdWareneingang = await this.warenEingangRepository.save(wareneingang).catch((err) => {
        console.log(err)
        return err;
      });
      return await this.warenEingangRepository.findOne({ where: { id: createdWareneingang.id }, relations: {
        products: { produkt: true },
        lieferant: true,
      }});
    } catch (error) {
      throw new HttpException('Fehler beim Erstellen des Wareneingangs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(wareneingangDto: WarenEingangDto): Promise<Wareneingang> {
    try {
      const foundWareneingang = await this.warenEingangRepository.findOne({ where: { id: wareneingangDto.id }, relations: {
        products: { produkt: true },
        lieferant: true,
      }});
      
      if (!foundWareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (foundWareneingang.gebucht) {
        throw new HttpException('Bereits gebuchter Wareneingang kann nicht aktualisiert werden', HttpStatus.BAD_REQUEST);
      }
  
      const merged = await this.warenEingangRepository.merge(foundWareneingang, wareneingangDto);
      if(wareneingangDto.gebucht)
      {
       const items = foundWareneingang.products;
       const itemsSave: Produkt[] = [];
     
        for (let i = 0; i < items.length; i++) {
         
          const wcolor: ColorDto[] = JSON.parse(items[i].color);
          const pcolor: ColorDto[] = JSON.parse(items[i].produkt[0].color);
         

      
     
          let currentMenge = items[i].produkt[0].currentmenge;
          let totalMenge = 0;

          if(wcolor.length === 1 && pcolor.length === 0) {
            currentMenge += wcolor[0].menge;
            totalMenge += wcolor[0].menge;
            pcolor.push(wcolor[0]);
          } else {
            
            for (let y = 0; y < wcolor.length; y++) {
                  currentMenge += wcolor[y].menge;
                  totalMenge += wcolor[y].menge;
                  pcolor[y].menge += wcolor[y].menge; 
              }
          }
       
          items[i].produkt[0].currentmenge = currentMenge;
          items[i].produkt[0].verfgbarkeit = true;
          items[i].produkt[0].color = JSON.stringify(pcolor);

          let isItemAllready = false;
          for (let x = 0; x < itemsSave.length; x++) {
            if(items[i].produkt[0].id === itemsSave[x].id) {
              isItemAllready = true;
              itemsSave[x].currentmenge += totalMenge;
            }
          }
          if(!isItemAllready)
          itemsSave.push(items[i].produkt[0]);
        }
    
          return await this.prodRepo.manager.transaction( async (transactionEntityManager) => {
            await transactionEntityManager.save(itemsSave);
            const updatedItem =  await transactionEntityManager.save(merged);
            return updatedItem;
          })
      
      
      }

      const updatedWareneingang = await this.warenEingangRepository.save(merged);
      return updatedWareneingang;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {

        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
     return await (await this.warenEingangRepository.delete(id)).affected;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async addProduct(wareneingangId: number, productDto: WarenEingangProductDto): Promise<WareneingangProduct> {
    try {
      const wareneingang = await this.warenEingangRepository.findOne({ where: { id: wareneingangId }, relations: { products: { produkt: true } }});
      if (!wareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (wareneingang.gebucht) {
        throw new HttpException('Produkt kann nicht zu einem bereits gebuchten Wareneingang hinzugefügt werden', HttpStatus.BAD_REQUEST);
      }
      
      const product = this.warenEingangProductRepository.create(productDto);
      product.produkt = productDto.produkt as unknown as Produkt[];
      wareneingang.products.push(product);
 
      const saved = await this.warenEingangRepository.save(wareneingang).catch(err => {
        console.log(err);
        return err;
      });
      return saved.products[saved.products.length -1];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      const product = await this.warenEingangProductRepository.findOne({where: { id: productId }}).catch(err => {
        console.log(err)
      });
      
      if (!product) {
        throw new NotFoundException('Produkt nicht gefunden');
      }
      const merged = await this.warenEingangProductRepository.merge(product, productDto);
      return await this.warenEingangProductRepository.save(merged);
    } catch (error) {
      
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
     
      const product = wareneingang.products.find((product) => product.id == productId);
      const index = wareneingang.products.findIndex((tmp) => tmp.id == productId);
      wareneingang.products.splice(index, 1);
      await this.warenEingangRepository.save(wareneingang);
      if (!product) {
        throw new NotFoundException('Produkt nicht gefunden');
      }
    
     return await (await this.warenEingangProductRepository.delete(productId)).affected;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}