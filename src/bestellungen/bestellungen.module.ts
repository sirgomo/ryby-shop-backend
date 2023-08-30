import { Module } from '@nestjs/common';
import { BestellungenController } from './bestellungen.controller';
import { BestellungenService } from './bestellungen.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bestellung, ProduktInBestellung]), AuthModule],
  controllers: [BestellungenController],
  providers: [BestellungenService]
})
export class BestellungenModule {}
