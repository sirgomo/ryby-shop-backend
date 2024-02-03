import { Module } from '@nestjs/common';
import { EbaySoldController } from './ebay-sold.controller';
import { EbaySoldService } from './ebay-sold.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { AuthModule } from 'src/auth/auth.module';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EbayTransactions, LogsEntity]),
    AuthModule,
  ],
  controllers: [EbaySoldController],
  providers: [EbaySoldService, LogsService],
})
export class EbaySoldModule {}
