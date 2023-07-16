import { Bestellung } from "src/entity/bestellungEntity";
import { ProduktRueckgabe } from "src/entity/productRuckgabeEntity";
import { ProductDto } from "./product.dto";
import { Produkt } from "src/entity/produktEntity";

export class ProductBestellungDto {
    
    id: number;
  
  
    bestellung: Bestellung;
  
 
    produkt: Produkt[];
  
   
    menge: number;
  
   
    rabatt: number;
  
  
    mengeGepackt: number;
    productRucgabe: ProduktRueckgabe;
}