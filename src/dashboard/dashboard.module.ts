import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { EbayItemSold } from 'src/entity/ebay/ebayItemSold';
import { Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { WareneingangProdVartiaion } from 'src/entity/waren_eingang_prod_variation';
import { EbayService } from 'src/ebay/ebay.service';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';

@Module({
  imports: [TypeOrmModule.forFeature([EbayTransactions, EbayItemSold, Bestellung, ProduktInBestellung, Wareneingang, WareneingangProdVartiaion, CompanyDataEntity]), AuthModule],
  providers: [DashboardService, EbayService],
  controllers: [DashboardController]
})
export class DashboardModule {}
