import { Bestellung } from "src/entity/bestellungEntity";
import { ProduktRueckgabe } from "src/entity/productRuckgabeEntity";
import { Produkt } from "src/entity/produktEntity";

export class ProductBestellungDto {
    id?: number;
    bestellung: Bestellung;
    produkt: Produkt[];
    menge: number;
    color: string;
    rabatt: number;
    mengeGepackt: number;
    productRucgabe: ProduktRueckgabe;
}