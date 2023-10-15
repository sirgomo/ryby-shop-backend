import { IsNotEmpty, IsOptional, isNotEmpty } from "class-validator";
import { Produkt } from "src/entity/produktEntity";


export class ProductVariationDto {
    @IsNotEmpty()
    sku: string  
    @IsNotEmpty()
    produkt: Produkt;
    @IsNotEmpty()
    variations_name: string;
    @IsNotEmpty()
    hint: string;
    @IsNotEmpty()
    value: string;
    @IsOptional()
    unit: string;
    @IsNotEmpty()
    image: string;
}