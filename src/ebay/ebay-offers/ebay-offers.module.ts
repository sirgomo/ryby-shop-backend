import { Module } from '@nestjs/common';
import { EbayOffersController } from './ebay-offers.controller';
import { EbayOffersService } from './ebay-offers.service';
import { AuthModule } from 'src/auth/auth.module';
import { EbayService } from '../ebay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyDataEntity]), AuthModule],
  controllers: [EbayOffersController],
  providers: [EbayOffersService, EbayService],
})
export class EbayOffersModule {}
