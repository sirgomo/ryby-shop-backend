import { Bestellung } from "src/entity/bestellungEntity";
import { ProduktRueckgabe } from "src/entity/productRuckgabeEntity";
import { ProductDto } from "./product.dto";

export class ProductBestellungDto {
    
    id: number;
  
  
    bestellung: Bestellung;
  
 
    produkt: ProductDto[];
  
   
    menge: number;
  
   
    rabatt: number;
  
  
    mengeGepackt: number;
    productRucgabe: ProduktRueckgabe;
}