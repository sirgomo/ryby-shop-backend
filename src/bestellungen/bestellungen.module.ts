import { Module } from '@nestjs/common';
import { BestellungenController } from './bestellungen.controller';
import { BestellungenService } from './bestellungen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { AuthModule } from 'src/auth/auth.module';
import { Produkt } from 'src/entity/produktEntity';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { EbayOffersService } from 'src/ebay/ebay-offers/ebay-offers.service';
import { EbayService } from 'src/ebay/ebay.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bestellung,
      ProduktInBestellung,
      Produkt,
      LogsEntity,
      CompanyDataEntity,
    ]),
    AuthModule,
  ],
  controllers: [BestellungenController],
  providers: [
    BestellungenService,
    LogsService,
    EbayService,
    EbayOffersService,
    MailService,
  ],
})
export class BestellungenModule {}
