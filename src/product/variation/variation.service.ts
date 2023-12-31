import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteFileDto } from 'src/dto/deleteFilde.dto';
import { ProductVariationDto } from 'src/dto/productVariation.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class VariationService {
  constructor(
    @InjectRepository(ProduktVariations)
    private produktVariationsRepository: Repository<ProduktVariations>,
    private dataSource: DataSource,
  ) {}

  async findAllforSelect() {
    try {
      return await this.produktVariationsRepository
        .createQueryBuilder()
        .select('variations_name')
        .groupBy('variations_name')
        .getRawMany();
    } catch (err) {
      throw err;
    }
  }

  async findByVariationsName(variations_name: string) {
    try {
      return await this.produktVariationsRepository.find({
        where: {
          variations_name: variations_name,
        },
      });
    } catch (err) {
      throw err;
    }
  }

  async findOne(sku: string) {
    try {
      const item = await this.produktVariationsRepository.findOne({
        where: {
          sku: sku,
        },
      });
      if (!item)
        throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

      return item;
    } catch (err) {
      throw err;
    }
  }

  async create(produktVariations: ProductVariationDto) {
    try {
      const item =
        await this.produktVariationsRepository.create(produktVariations);
      return await this.produktVariationsRepository.save(item);
    } catch (err) {
      throw err;
    }
  }

  async delete(sku: string) {
    try {
      const item = await this.produktVariationsRepository.findOne({
        where: { sku: sku },
      });
      if (!item)
        throw new HttpException(
          `Item with ${sku} not found`,
          HttpStatus.NOT_FOUND,
        );

      if (item.quanity > 0 || item.quanity_sold)
        throw new HttpException(
          'Item quantitat is bigger then 0, its not popssible to delete it',
          HttpStatus.BAD_REQUEST,
        );

      if (item.image && item.image.length > 2)
        await this.deleteImage({ produktid: sku, fileid: item.image });

      return await this.produktVariationsRepository.delete(sku);
    } catch (err) {
      throw err;
    }
  }

  async update(sku: string, produktVariations: Partial<ProduktVariations>) {
    try {
      return await this.produktVariationsRepository.update(
        sku,
        produktVariations,
      );
    } catch (err) {
      throw err;
    }
  }
  async deleteImage(image: DeleteFileDto): Promise<boolean> {
    try {
      const item = await this.produktVariationsRepository.findOne({
        where: { sku: image.produktid },
      });
      //if item is praoduktVariationclass
      if (item) {
        item.image = '';
        await this.produktVariationsRepository.save(item);
        return true;
      }
      //if item is Produkt class
      const itemP: Produkt = await this.dataSource
        .getRepository(Produkt)
        .findOne({ where: { sku: image.produktid } });

      if (itemP) {
        itemP.produkt_image = '';
        await this.dataSource.getRepository(Produkt).save(itemP);
        return true;
      }

      return false;
    } catch (err) {
      throw err;
    }
  }
  async addImage(image: string, productid: string): Promise<boolean> {
    try {
      const item = await this.produktVariationsRepository.findOne({
        where: { sku: productid },
      });

      if (item.variations_name) {
        item.image = image;
        await this.produktVariationsRepository.save(item);
        return true;
      }
      const itemP: Produkt = await this.dataSource
        .getRepository(Produkt)
        .findOne({ where: { sku: productid } });

      if (itemP) {
        itemP.produkt_image = image;
        await this.dataSource
          .getRepository(Produkt)
          .save(itemP)
          .catch((err) => {
            console.log(err);
          });
        return true;
      }
      return false;
    } catch (err) {
      throw err;
    }
  }
  async saveImageEbayLink(link: { link: string; id: string }) {
    try {
      const varItem = await this.produktVariationsRepository.findOne({
        where: { sku: link.id },
      });
      if (varItem) {
        varItem.image = link.link;
        await this.produktVariationsRepository.save(varItem);

        return { imageid: link.link };
      }
      const prodItem = await this.dataSource
        .getRepository(Produkt)
        .findOne({ where: { sku: link.id } });

      if (prodItem) {
        prodItem.produkt_image = link.link;
        await this.dataSource.getRepository(Produkt).save(prodItem);
        return { imageid: link.link };
      }

      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    } catch (err) {
      throw err;
    }
  }
}
