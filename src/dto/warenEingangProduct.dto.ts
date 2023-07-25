import { Wareneingang } from "src/entity/warenEingangEntity";
import { ProductDto } from "./product.dto";
import { Optional } from "@nestjs/common";
import { IsNotEmpty, IsNumber } from "class-validator";

export class WarenEingangProductDto {
    @Optional()
    @IsNumber()
    id: number;
    @IsNotEmpty()
    wareneingang: Wareneingang;
    @IsNotEmpty()
    produkt: ProductDto[];
    @IsNumber()
    menge: number;
    @IsNumber()
    preis: number;
    @IsNumber()
    mwst: number;
}