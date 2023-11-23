import { EbayRefundItemDto } from "./ebayRefundItemDto";
import { EbayTranscationsDto } from "./ebayTransactionDto";

export class EbayRefundDto {
    id?: number;
    orderId: string;
    creationDate: boolean;
    reason: string;
    amount: number;
    transaction: EbayTranscationsDto;
    refund_items: EbayRefundItemDto[];
}