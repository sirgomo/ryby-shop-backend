import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { AuthModule } from 'src/auth/auth.module';
import { PhotoService } from 'src/service/photoService';
import { EanEntity } from 'src/entity/eanEntity';
import { VariationModule } from './variation/variation.module';

@Module({
  imports: [TypeOrmModule.forFeature([Produkt, EanEntity]), AuthModule, VariationModule],
  providers: [ProductService, PhotoService],
  controllers: [ProductController]
})
export class ProductModule {}
