import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { AuthModule } from 'src/auth/auth.module';
import { EbayService } from 'src/ebay/ebay.service';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EbayRefund, CompanyDataEntity, LogsEntity]),
    AuthModule,
  ],
  controllers: [RefundController],
  providers: [RefundService, EbayService, LogsService],
})
export class RefundModule {}
