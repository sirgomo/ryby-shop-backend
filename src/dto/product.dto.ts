import { Kategorie } from "src/entity/kategorieEntity";
import { LieferantDto } from "./liferant.dto";
import { ProductBestellungDto } from "./productBestellung.dto";
import { WareneingangProduct } from "src/entity/warenEingangProductEntity";
import { Kundenbewertung } from "src/entity/kundenBewertungEntity";
import { Aktion } from "src/entity/promocjeEntity";
import { Reservierung } from "src/entity/reservierungEntity";
import { Stellplatze } from "src/entity/stellplatzeEntity";
import { WarenausgangProduct } from "src/entity/warenAusgangProductEntity";
import { IsNotEmpty, IsString, IsNumber, IsBoolean } from "class-validator";

export class ProductDto{
    id: number | undefined;

    @IsNotEmpty()
    @IsString()
    name: string;
  
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
  
    @IsNotEmpty()
    @IsString()
    thumbnail: string;
  

    lieferant: LieferantDto;
  

    lagerorte: Stellplatze[];
  
 
    bestellungen: ProductBestellungDto[];
  
    @IsNotEmpty()
    datumHinzugefuegt: string;
  
 
    kategorie: Kategorie[];
  
    @IsBoolean()
    verfgbarkeit: boolean;
  
    @IsNumber()
    mindestmenge: number;
  
    @IsBoolean()
    aktion: boolean;
  
    @IsNumber()
    verkaufteAnzahl: number;
  

    wareneingang: WareneingangProduct[];
  

    warenausgang: WarenausgangProduct[];
  
    @IsNumber()
    mehrwehrsteuer: number;
  

    promocje: Aktion[];
  

    reservation: Reservierung[];
  

    bewertung: Kundenbewertung[];
}
      
