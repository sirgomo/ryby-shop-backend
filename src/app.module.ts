import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'env/env';
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
import { Aktion } from './entity/promocjeEntity';
import { Warenausgang } from './entity/warenAusgangEntity';
import { WarenausgangProduct } from './entity/warenAusgangProductEntity';
import { Wareneingang } from './entity/warenEingangEntity';
import { WareneingangProduct } from './entity/warenEingangProductEntity';
import { Reservierung } from './entity/reservierungEntity';
import { Stellplatze } from './entity/stellplatzeEntity';

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
        Warenausgang,
        WarenausgangProduct,
        Wareneingang,
        WareneingangProduct,
        Reservierung,
        Stellplatze,
      ],
      synchronize: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
