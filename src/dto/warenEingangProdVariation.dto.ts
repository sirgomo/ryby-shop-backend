import { WarenEingangProductDto } from "./warenEingangProduct.dto";

export class WarenEingangProdVariationDto {
    id: number;
    sku: string;
    quanity: number;
    price: number;
    mwst: number;
    quanity_stored: number;
    waren_eingang_product: WarenEingangProductDto;
}