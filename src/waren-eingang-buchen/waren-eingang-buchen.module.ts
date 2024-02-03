import { Module } from '@nestjs/common';
import { WarenEingangBuchenService } from './waren-eingang-buchen.service';
import { WarenEingangBuchenController } from './waren-eingang-buchen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { AuthModule } from 'src/auth/auth.module';
import { WareneingangProduct } from 'src/entity/warenEingangProductEntity';
import { Produkt } from 'src/entity/produktEntity';
import { WareneingangProdVartiaion } from 'src/entity/waren_eingang_prod_variation';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wareneingang,
      WareneingangProduct,
      Produkt,
      WareneingangProdVartiaion,
      LogsEntity,
    ]),
    AuthModule,
  ],
  providers: [WarenEingangBuchenService, LogsService],
  controllers: [WarenEingangBuchenController],
})
export class WarenEingangBuchenModule {}
