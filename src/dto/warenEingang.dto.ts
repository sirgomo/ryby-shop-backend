import { IsNotEmpty, IsNumber, IsObject, IsOptional } from "class-validator";
import { LieferantDto } from "./liferant.dto";
import { WarenEingangProductDto } from "./warenEingangProduct.dto";
import { LagerDto } from "src/dto/lager.dto";

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

    shipping_cost: number;
    remarks: string;
    other_cost: number;
    @IsObject({ message: 'Lager kann nicht leer sein' })
    location: LagerDto;
}