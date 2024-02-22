import { Bestellung } from 'src/entity/bestellungEntity';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { Produkt } from 'src/entity/produktEntity';

export class ProductBestellungDto {
  id?: number;
  bestellung: Bestellung;
  produkt: Produkt[];
  menge: number;
  color: string;
  color_gepackt: string;
  rabatt: number;
  mengeGepackt: number;
  verkauf_price: number;
  verkauf_rabat: number;
  verkauf_steuer: number;
  productRucgabe: ProduktRueckgabe;
}
