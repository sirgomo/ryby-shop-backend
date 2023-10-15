import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'src/env/env';
import { AdresseKunde } from './entity/addressEntity';
import { Bestellung } from './entity/bestellungEntity';
import { Kategorie } from './entity/kategorieEntity';
import { Kunde } from './entity/kundeEntity';
import { Kundenbewertung } from './entity/kundenBewertungEntity';
import { Lager } from './entity/lagerEntity';
import { Lieferadresse } from './entity/liferAddresseEntity';
import { Lieferant } from './entity/lifernatEntity';
import { Produkt } from './entity/produktEntity';
import { ProduktInBestellung } from './entity/productBestellungEntity';
import { ProduktRueckgabe } from './entity/productRuckgabeEntity';
import { Aktion } from './entity/aktionEntity';
import { Wareneingang } from './entity/warenEingangEntity';
import { WareneingangProduct } from './entity/warenEingangProductEntity';
import { Stellplatze } from './entity/stellplatzeEntity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KategorieModule } from './kategorie/kategorie.module';
import { LiferantModule } from './liferant/liferant.module';
import { ProductModule } from './product/product.module';
import { WarenEingangBuchenModule } from './waren-eingang-buchen/waren-eingang-buchen.module';
import { CompanyDataEntity } from './entity/companyDataEntity';
import { CompanyModule } from './company/company.module';
import { BestellungenModule } from './bestellungen/bestellungen.module';
import { EanEntity } from './entity/eanEntity';
import { EbayModule } from './ebay/ebay.module';
import { ProduktVariations } from './entity/produktVariations';



@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.host,
      port: env.port,
      username: env.user,
      password: env.pass,
      database: env.db,
      entities: [
        AdresseKunde,
        Bestellung,
        Kategorie,
        Kunde,
        Kundenbewertung,
        Lager,
        Lieferadresse,
        Lieferant,
        Produkt,
        ProduktInBestellung,
        ProduktRueckgabe,
        Aktion,
        Wareneingang,
        WareneingangProduct,
        Stellplatze,
        CompanyDataEntity,
        EanEntity,
        ProduktVariations
      ],
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    KategorieModule,
    LiferantModule,
    ProductModule,
    WarenEingangBuchenModule,
    CompanyModule,
    BestellungenModule,
    EbayModule,
    
  ],
  controllers: [AppController],
  providers: [AppService, AuthModule],
})
export class AppModule {}
