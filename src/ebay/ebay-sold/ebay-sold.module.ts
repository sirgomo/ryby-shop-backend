import { Module } from '@nestjs/common';
import { EbaySoldController } from './ebay-sold.controller';
import { EbaySoldService } from './ebay-sold.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { AuthModule } from 'src/auth/auth.module';
import { EbayItemSold } from 'src/entity/ebay/ebayItemSold';

@Module({
  imports: [TypeOrmModule.forFeature([EbayTransactions]), AuthModule],
  controllers: [EbaySoldController],
  providers: [EbaySoldService]
})
export class EbaySoldModule {}
