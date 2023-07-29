import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { LieferantDto } from "./liferant.dto";
import { WarenEingangProductDto } from "./warenEingangProduct.dto";

export class WarenEingangDto {
    @IsOptional()
    @IsNumber()
    id: number;
    products: WarenEingangProductDto[]
    @IsNotEmpty()
    lieferant: LieferantDto;
    empfangsdatum: Date;
    @IsNotEmpty()
    rechnung: string;

    lieferscheinNr: string;
    //buchungs datum
    datenEingabe: Date;
    gebucht: boolean;
    eingelagert: boolean;
}