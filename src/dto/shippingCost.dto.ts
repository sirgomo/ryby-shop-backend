import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import { ProductDto } from "./product.dto";
import { Produkt } from "src/entity/produktEntity";

export class ShippingCostDto {
    @IsOptional()
    id: number;
    
    @IsNotEmpty()
    @IsString()
    shipping_name: string;

    @IsNotEmpty()
    @IsNumber()
    shipping_price: number;

    @IsNotEmpty()
    @IsNumber()
    average_material_price: number;
    @IsOptional()
    produkt: Produkt[];
}