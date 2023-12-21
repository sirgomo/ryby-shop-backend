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
      return err;
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
      return err;
    }
  }

  async findOne(sku: string) {
    try {
      return await this.produktVariationsRepository.findOne({
        where: {
          sku: sku,
        },
      });
    } catch (err) {
      return err;
    }
  }

  async create(produktVariations: ProductVariationDto) {
    try {
      const item =
        await this.produktVariationsRepository.create(produktVariations);
      return await this.produktVariationsRepository.save(item);
    } catch (err) {}
  }

  async delete(sku: string) {
    try {
      const item = await this.produktVariationsRepository.findOne({
        where: { sku: sku },
      });

      if (item.quanity > 0)
        throw new HttpException(
          'Item kann nicht gelöscht werden, Menge is größer als 0',
          HttpStatus.BAD_REQUEST,
        );

      if (item.image && item.image.length > 2)
        await this.deleteImage({ produktid: sku, fileid: item.image });

      return await this.produktVariationsRepository.delete(sku);
    } catch (err) {
      return err;
    }
  }

  async update(sku: string, produktVariations: Partial<ProduktVariations>) {
    try {
      return await this.produktVariationsRepository.update(
        sku,
        produktVariations,
      );
    } catch (err) {
      return err;
    }
  }
  async deleteImage(image: DeleteFileDto): Promise<boolean> {
    try {
      const item = await this.produktVariationsRepository.findOne({
        where: { sku: image.produktid },
      });
      if (item) {
        item.image = '';
        await this.produktVariationsRepository.save(item);
        return true;
      }
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
      console.log(err);
      return err;
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
      return err;
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
      return prodItem;
    } catch (err) {
      console.log(err);
      throw new Error(err.message);
    }
  }
}
