import { EbayRefundDto } from "./ebayRefundDto";
import { EbayTransactionsItemDto } from "./ebayTransactionItemDto";

export class EbayRefundItemDto {
    id?: number;
    refund_item: EbayRefundDto;
    amount: number;
    item: EbayTransactionsItemDto;
}