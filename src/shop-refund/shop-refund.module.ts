import { Module } from '@nestjs/common';
import { ShopRefundService } from './shop-refund.service';
import { ShopRefundController } from './shop-refund.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProduktRueckgabe, LogsEntity]),
    AuthModule,
  ],
  providers: [ShopRefundService, LogsService],
  controllers: [ShopRefundController],
})
export class ShopRefundModule {}
