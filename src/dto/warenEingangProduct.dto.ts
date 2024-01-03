import { Wareneingang } from 'src/entity/warenEingangEntity';
import { ProductDto } from './product.dto';
import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { WarenEingangProdVariationDto } from './warenEingangProdVariation.dto';

export class WarenEingangProductDto {
  @Optional()
  id: number;
  @IsNotEmpty()
  wareneingang: Wareneingang;
  @IsNotEmpty()
  produkt: ProductDto[];
  product_variation: WarenEingangProdVariationDto[];
}
