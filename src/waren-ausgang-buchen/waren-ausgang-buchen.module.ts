import { Module } from '@nestjs/common';
import { WarenAusgangBuchenController } from './waren-ausgang-buchen.controller';
import { WarenAusgangBuchenService } from './waren-ausgang-buchen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warenausgang } from 'src/entity/warenAusgangEntity';
import { WarenausgangProduct } from 'src/entity/warenAusgangProductEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Warenausgang, WarenausgangProduct]), AuthModule],
  controllers: [WarenAusgangBuchenController],
  providers: [WarenAusgangBuchenService]
})
export class WarenAusgangBuchenModule {}
