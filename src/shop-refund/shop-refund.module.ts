import { Module } from '@nestjs/common';
import { ShopRefundService } from './shop-refund.service';
import { ShopRefundController } from './shop-refund.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';

@Module({
  imports: [TypeOrmModule.forFeature([ProduktRueckgabe]), AuthModule],
  providers: [ShopRefundService],
  controllers: [ShopRefundController]
})
export class ShopRefundModule {}
