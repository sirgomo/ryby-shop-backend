import { EbayRefundDto } from "./ebayRefundDto";
import { EbayTransactionsItemDto } from "./ebayTransactionItemDto";

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
    items: EbayTransactionsItemDto[];
    refunds: EbayRefundDto[];
}