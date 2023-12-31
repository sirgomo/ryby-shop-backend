import { WarenEingangProductDto } from './warenEingangProduct.dto';

export class WarenEingangProdVariationDto {
  id: number;
  sku: string;
  quanity: number;
  price: number;
  price_in_euro: number;
  mwst: number;
  quanity_stored: number;
  quanity_sold_at_once: number;
  waren_eingang_product: WarenEingangProductDto;
}
