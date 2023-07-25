import { Module } from '@nestjs/common';
import { WarenEingangBuchenService } from './waren-eingang-buchen.service';
import { WarenEingangBuchenController } from './waren-eingang-buchen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { AuthModule } from 'src/auth/auth.module';
import { WareneingangProduct } from 'src/entity/warenEingangProductEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Wareneingang, WareneingangProduct]), AuthModule],
  providers: [WarenEingangBuchenService],
  controllers: [WarenEingangBuchenController]
})
export class WarenEingangBuchenModule {}
