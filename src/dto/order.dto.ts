import { Kunde } from "src/entity/kundeEntity";
import { ProductBestellungDto } from "./productBestellung.dto";
import { BESTELLUNGSSTATUS } from "src/entity/bestellungEntity";
import { IsArray, IsObject, IsOptional } from "class-validator";

export class OrderDto {
    @IsOptional()
    id: number;
    @IsObject()
    kunde: Kunde;
    @IsArray()
    produkte: ProductBestellungDto[];
    bestelldatum: Date;
    status: string;
    lieferdatum: Date;
    zahlungsart: string;
    gesamtwert: number;
    zahlungsstatus: string;
    bestellungstatus: BESTELLUNGSSTATUS;
    versandart: string;
    versandprice: number;
    varsandnr: string;
}