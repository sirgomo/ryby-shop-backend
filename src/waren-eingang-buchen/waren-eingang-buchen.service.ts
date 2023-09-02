import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ColorDto } from 'src/dto/color.dto';

import { WarenEingangDto } from 'src/dto/warenEingang.dto';
import { WarenEingangProductDto } from 'src/dto/warenEingangProduct.dto';
import { Produkt } from 'src/entity/produktEntity';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { WareneingangProduct } from 'src/entity/warenEingangProductEntity';
import { DeleteResult, Repository } from 'typeorm';


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
   /**
 * Returns all wareneingang entries
 * @returns {Promise<Wareneingang[]>} A promise that resolves to an array of wareneingang entries
 * @throws {Error} If there is an error fetching the data
 */
  async getAll(): Promise<Wareneingang[]> {
    try {
      return await this.warenEingangRepository.createQueryBuilder('buchungen')
      .leftJoinAndSelect('buchungen.lieferant', 'lieferant')
      .getMany();
    } catch (err) {
      throw new HttpException('Fehler beim Abrufen der Daten', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
  }
  /**
 * Finds a wareneingang entry by its id
 * @param {number} id - The id of the wareneingang entry
 * @returns {Promise<Wareneingang>} A promise that resolves to a wareneingang entry
 * @throws {NotFoundException} If the wareneingang entry is not found
 */
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
/**
 * Creates a new wareneingang entry
 * @param {WarenEingangDto} wareneingangDto - The data for the new wareneingang entry
 * @returns {Promise<Wareneingang>} A promise that resolves to the newly created wareneingang entry
 * @throws {HttpException} If there is an error creating the wareneingang entry
 */
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
      throw error;
    }
  }

/**
 * Updates a wareneingang entry
 * @param {WarenEingangDto} wareneingangDto - The updated data for the wareneingang entry
 * @returns {Promise<Wareneingang>} A promise that resolves to the updated wareneingang entry
 * @throws {NotFoundException} If the wareneingang entry is not found
 * @throws {HttpException} If there is an error updating the wareneingang entry
 */
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
      let updatedWareneingang; 
      if(wareneingangDto.gebucht)
      {
       return this.bookWareneingang(foundWareneingang, merged);
      }

      updatedWareneingang =  await this.warenEingangRepository.save(merged);
      return updatedWareneingang;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }
  }
 /**
 * Books a wareneingang entry by updating the associated products and saving the changes using a transaction
 * @param {Wareneingang} foundWareneingang - The found wareneingang entry
 * @param {Wareneingang} merged - The merged wareneingang entry with updated data
 * @returns {Promise<Wareneingang>} A promise that resolves to the updated wareneingang entry
 */
  private async bookWareneingang(foundWareneingang: Wareneingang, merged: Wareneingang) {
    const items = foundWareneingang.products;
    const itemsSave: Produkt[] = [];

    for (let i = 0; i < items.length; i++) {

      const wcolor: ColorDto[] = JSON.parse(items[i].color);
      const pcolor: ColorDto[] = JSON.parse(items[i].produkt[0].color);




      let currentMenge = items[i].produkt[0].currentmenge;
      let totalMenge = 0;

      if (wcolor.length === 1 && pcolor.length === 0) {
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
      items[i].produkt[0].verfgbarkeit = 1;
      items[i].produkt[0].color = JSON.stringify(pcolor);

      let isItemAllready = false;
      for (let x = 0; x < itemsSave.length; x++) {
        if (items[i].produkt[0].id === itemsSave[x].id) {
          isItemAllready = true;
          itemsSave[x].currentmenge += totalMenge;
        }
      }
      if (!isItemAllready)
        itemsSave.push(items[i].produkt[0]);
    }

    return await this.prodRepo.manager.transaction(async (transactionEntityManager) => {
      await transactionEntityManager.save(itemsSave);
      const updatedItem = await transactionEntityManager.save(merged);
      return updatedItem;
    });
  }
/**
 * Deletes a wareneingang entry
 * @param {number} id - The id of the wareneingang entry to delete
 * @returns {Promise<DeleteResult>} A promise that return affected rows (0 or 1)
 * @throws {NotFoundException} If the wareneingang entry is not found
 * @throws {HttpException} If there is an error deleting the wareneingang entry
 */
  async delete(id: number): Promise<DeleteResult> {
    try {
      const foundWareneingang = await this.warenEingangRepository.findOne( { where: { id : id } });
      if (!foundWareneingang) {
        throw new NotFoundException('Wareneingang nicht gefunden');
      }
      if (foundWareneingang.gebucht) {
        throw new HttpException('Bereits gebuchter Wareneingang kann nicht gelöscht werden', HttpStatus.BAD_REQUEST);
      }
     return await this.warenEingangRepository.delete(id).catch((err) => {
      console.log(err);
      throw new HttpException('Es ist ein Feheler aufgetreten, Produkt würde nicht gelöscht', HttpStatus.INTERNAL_SERVER_ERROR);
     });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }
  }
/**
 * Adds a product to a wareneingang entry
 * @param {number} wareneingangId - The id of the wareneingang entry
 * @param {WarenEingangProductDto} productDto - The data for the product to add
 * @returns {Promise<WareneingangProduct>} A promise that resolves to the newly added product
 * @throws {NotFoundException} If the wareneingang entry is not found
 * @throws {HttpException} If there is an error adding the product
 */
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
        throw new HttpException('Es ist ein Fehler aufgetreten beim Speichern vom Produkt, abgebrochen', HttpStatus.INTERNAL_SERVER_ERROR);
      });
      return saved.products[saved.products.length -1];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }
  }
/**
 * Updates a product in a wareneingang entry
 * @param {number} wareneingangId - The id of the wareneingang entry
 * @param {number} productId - The id of the product to update
 * @param {WarenEingangProductDto} productDto - The updated data for the product
 * @returns {Promise<WareneingangProduct>} A promise that resolves to the updated product
 * @throws {NotFoundException} If the wareneingang entry or product is not found
 * @throws {HttpException} If there is an error updating the product
 */
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
        throw error;
      }
    }
  }
/**
 * Deletes a product from a wareneingang entry
 * @param {number} wareneingangId - The id of the wareneingang entry
 * @param {number} productId - The id of the product to delete
 * @returns {Promise<number>} A promise that resolves to the number of affected rows (0 or 1)
 * @throws {NotFoundException} If the wareneingang entry or product is not found
 * @throws {HttpException} If there is an error deleting the product
 */
  async deleteProduct(wareneingangId: number, productId: number): Promise<DeleteResult> {
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
      if (!product) {
        throw new NotFoundException('Produkt nicht gefunden');
      }
      wareneingang.products.splice(index, 1);
      await this.warenEingangRepository.save(wareneingang);
  
    
     return await this.warenEingangProductRepository.delete(productId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw error;
      }
    }
  }
}