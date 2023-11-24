import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { AuthModule } from 'src/auth/auth.module';
import { EbayService } from 'src/ebay/ebay.service';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';

@Module({
  imports: [TypeOrmModule.forFeature([EbayRefund, CompanyDataEntity]), AuthModule],
  controllers: [RefundController],
  providers: [RefundService, EbayService]
})
export class RefundModule {}
