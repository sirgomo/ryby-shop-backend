import { Produkt } from 'src/entity/produktEntity';

export class AktionDto {
  id?: number;
  aktion_key: string;
  produkt: Produkt[];
  startdatum: string;
  enddatum: string;
  rabattProzent: number;
}
