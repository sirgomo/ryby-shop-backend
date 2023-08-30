import { Kunde } from "src/entity/kundeEntity";
import { Reservierung } from "src/entity/reservierungEntity";
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
    reservation: Reservierung;
}