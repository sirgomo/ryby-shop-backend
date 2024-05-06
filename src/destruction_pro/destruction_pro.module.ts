import { Module } from '@nestjs/common';
import { DestructionProService } from './destruction_pro.service';
import { DestructionProController } from './destruction_pro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destruction_protocolEntity } from 'src/entity/destruction_protocolEntity';
import { AuthModule } from 'src/auth/auth.module';
import { EbayOffersService } from 'src/ebay/ebay-offers/ebay-offers.service';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LogsEntity } from 'src/entity/logsEntity';
import { EbayService } from 'src/ebay/ebay.service';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';


@Module({
  imports: [TypeOrmModule.forFeature([Destruction_protocolEntity, LogsEntity, CompanyDataEntity]), AuthModule],
  providers: [DestructionProService, EbayOffersService, LogsService, EbayService],
  controllers: [DestructionProController]
})
export class DestructionProModule {}
