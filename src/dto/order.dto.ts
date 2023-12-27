import { Kunde } from 'src/entity/kundeEntity';
import { BESTELLUNGSSTATUS } from 'src/entity/bestellungEntity';
import { IsArray, IsObject, IsOptional } from 'class-validator';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';

export class OrderDto {
  @IsOptional()
  id: number;
  @IsObject()
  kunde: Kunde;
  @IsArray()
  produkte: ProduktInBestellung[];
  bestelldatum: Date;
  status: string;
  versand_datum: Date;
  zahlungsart: string;
  gesamtwert: number;
  zahlungsstatus: string;
  bestellungstatus: BESTELLUNGSSTATUS;
  versandart: string;
  versandprice: number;
  varsandnr: string;
  paypal_order_id: string;
  @IsOptional()
  refunds: ProduktRueckgabe[];
}
