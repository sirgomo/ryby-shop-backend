import { EbayRefundDto } from "./ebayRefundDto";
import { EbayTransactionsItemDto } from "./ebayTransactionItemDto";

export class EbayTranscationsDto {
    id?: number;
    orderId: string;
    creationDate: Date;
    payment_status: string;
    items: EbayTransactionsItemDto[];
    refunds: EbayRefundDto[];
}