import { IsOptional } from "class-validator";
import { Produkt } from "src/entity/produktEntity";

export class EanDto {
    @IsOptional()
    id: number;
    eanCode: string;

}