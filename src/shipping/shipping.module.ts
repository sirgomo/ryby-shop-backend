import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ShippingEntity } from 'src/entity/shippingEntity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingEntity]), AuthModule],
  providers: [ShippingService],
  controllers: [ShippingController]
})
export class ShippingModule {}
