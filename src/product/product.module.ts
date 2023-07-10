import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Produkt]), AuthModule],
  providers: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
