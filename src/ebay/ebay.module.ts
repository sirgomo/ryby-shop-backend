import { Module } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { EbayController } from './ebay.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { AuthModule } from 'src/auth/auth.module';
import { SubsController } from './subs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyDataEntity]), AuthModule],
  providers: [EbayService],
  controllers: [EbayController, SubsController]
})
export class EbayModule {}
