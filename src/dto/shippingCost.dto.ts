import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

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
}