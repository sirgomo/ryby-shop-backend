import { EbayRefundItemDto } from "./ebayRefundItemDto";
import { EbayTranscationsDto } from "./ebayTransactionDto";

export class EbayTransactionsItemDto {
    id?: number;
    title: string;
    sku: string;
    quanity: number;
    price: number;
    transaction: EbayTranscationsDto;
    refund_item: EbayRefundItemDto;
}