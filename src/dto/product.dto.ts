import { Kategorie } from "src/entity/kategorieEntity";
import { LieferantDto } from "./liferant.dto";
import { WareneingangProduct } from "src/entity/warenEingangProductEntity";
import { Kundenbewertung } from "src/entity/kundenBewertungEntity";
import { Aktion } from "src/entity/aktionEntity";
import { Stellplatze } from "src/entity/stellplatzeEntity";
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional } from "class-validator";
import { ProduktInBestellung } from "src/entity/productBestellungEntity";
import { EanEntity } from "src/entity/eanEntity";
import { ProduktVariations } from "src/entity/produktVariations";

export class ProductDto{
    id: number | undefined;

    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsString()
    @IsOptional()
    sku: string;
  
    @IsNotEmpty()
    @IsNumber()
    preis: number;

    @IsNotEmpty()
    @IsNumber()
    artid: number;
  
    @IsNotEmpty()
    @IsString()
    beschreibung: string;

    @IsNotEmpty()
    @IsString()
    color: string;
  
    @IsNotEmpty()
    @IsString()
    foto: string;
  
    @IsOptional()
    thumbnail: string;
  

    lieferant: LieferantDto;
  

    lagerorte: Stellplatze[];
  
 
    bestellungen: ProduktInBestellung[];
  
    @IsNotEmpty()
    datumHinzugefuegt: string;
  
 
    kategorie: Kategorie[];
  
    @IsNumber()
    verfgbarkeit: number;
  
    @IsNumber()
    mindestmenge: number;
    @IsNumber()
    currentmenge: number;
    //A product symbol from a supplier
    @IsOptional()
    product_sup_id: string;
    @IsOptional()
    lange:number;
    @IsOptional()
    ebay: number;
    @IsNumber()
    verkaufteAnzahl: number;
 

    wareneingang: WareneingangProduct[];
  
  
    @IsNumber()
    mehrwehrsteuer: number;
  

    promocje: Aktion[];
  
    bewertung: Kundenbewertung[];
    eans: EanEntity[];
    variations: ProduktVariations[];
}
      
