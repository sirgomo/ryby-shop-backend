import { Module } from '@nestjs/common';
import { VariationController } from './variation.controller';
import { VariationService } from './variation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProduktVariations } from 'src/entity/produktVariations';
import { AuthModule } from 'src/auth/auth.module';
import { PhotoService } from 'src/service/photoService';

@Module({
  imports: [TypeOrmModule.forFeature([ProduktVariations]), AuthModule],
  controllers: [VariationController],
  providers: [VariationService, PhotoService]
})
export class VariationModule {}
