import { Module } from '@nestjs/common';
import { EbayOffersController } from './ebay-offers.controller';

@Module({
  controllers: [EbayOffersController]
})
export class EbayOffersModule {}
