import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Produkt } from 'src/entity/produktEntity';

export class ProductVariationDto {
  @IsNotEmpty()
  sku: string;
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
  @IsOptional()
  image: string;
  @IsNotEmpty()
  price: number;
  @IsNotEmpty()
  wholesale_price: number;
  @IsOptional()
  thumbnail: string;
  @IsNotEmpty()
  quanity: number;
  @IsNotEmpty()
  quanity_sold: number;
  @IsNotEmpty()
  @IsNumber()
  quanity_sold_at_once: number;
}
