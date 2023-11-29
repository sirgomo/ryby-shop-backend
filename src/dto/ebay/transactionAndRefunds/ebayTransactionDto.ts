import { EbayItemSold } from "src/entity/ebay/ebayItemSold";
import { EbayRefund } from "src/entity/ebay/ebayRefund";

export class EbayTranscationsDto {
    id?: number;
    orderId: string;
    creationDate: Date;
    payment_status: string;
    price_total: number;
    price_shipping: number;
    price_tax: number;
    price_discont: number;
    sel_amount: number;
    items: EbayItemSold[];
    refunds: EbayRefund[];
}