import { Module } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { EbayController } from './ebay.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { AuthModule } from 'src/auth/auth.module';
import { SubsController } from './subs.controller';
import { EbayInventoryController } from './ebay-inventory/ebay-inventory.controller';
import { ProductService } from 'src/product/product.service';
import { Produkt } from 'src/entity/produktEntity';
import { EanEntity } from 'src/entity/eanEntity';
import { EbayOffersModule } from './ebay-offers/ebay-offers.module';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyDataEntity, Produkt, EanEntity]), AuthModule, EbayOffersModule],
  providers: [EbayService, ProductService],
  controllers: [EbayController, SubsController, EbayInventoryController]
})
export class EbayModule {}
