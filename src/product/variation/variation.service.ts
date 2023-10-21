import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteFileDto } from 'src/dto/deleteFilde.dto';
import { ProductVariationDto } from 'src/dto/productVariation.dto';
import { ProduktVariations } from 'src/entity/produktVariations';
import { PhotoService } from 'src/service/photoService';
import { Repository } from 'typeorm';

@Injectable()
export class VariationService {
    constructor(
        @InjectRepository(ProduktVariations)
        private produktVariationsRepository: Repository<ProduktVariations>,
        private photoService: PhotoService
    ) {}

    async findAllforSelect() {
        try {
        return await this.produktVariationsRepository.createQueryBuilder()
        .select('variations_name')
        .groupBy('variations_name')
        .getRawMany();
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

    async create(produktVariations: ProductVariationDto) {
        try {
            const item = await this.produktVariationsRepository.create(produktVariations);
            return await this.produktVariationsRepository.save(item);
        } catch (err) {

        }
       
    }

    async delete(sku: string) {
        try {
          const item = await this.produktVariationsRepository.findOne({ where: { sku: sku}});

          if(item.image && item.image.length > 2)
           await this.deleteImage({produktid: sku, fileid: item.image});

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
    async deleteImage(image: DeleteFileDto) {
      try {
        const item = await this.produktVariationsRepository.findOne({where: { sku: image.produktid }});
        
        if(!item)
          return false;
  
        //  const images: string[] = JSON.parse(item.image);
        // const index = images.findIndex((tmp) => tmp === image.fileid)
        //  images.splice(index, 1);
        //  item.image = JSON.stringify(images);
        this.photoService.deletePhoto(image);
        item.image = '';
        await this.produktVariationsRepository.save(item);
        
        return true;
      } catch (err) {
        return err;
      }
    }
    async addImage(image: string, productid: string): Promise<boolean> {
      try {
        const item = await this.produktVariationsRepository.findOne({where: { sku : productid }});
        if(!item)
          return false;
  
      //  const currentImages: string[] = JSON.parse(item.image);
      //  currentImages.push(image);
      //  item.image = JSON.stringify(currentImages);
        item.image = image;
        await this.produktVariationsRepository.save(item);
  
        return true;
      } catch (err) {
        return err;
      }
    }
}
