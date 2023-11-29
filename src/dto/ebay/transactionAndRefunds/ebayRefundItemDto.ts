import { EbayRefund } from "src/entity/ebay/ebayRefund";
import { EbayItemSold } from "src/entity/ebay/ebayItemSold";

export class EbayRefundItemDto {
    id?: number;
    refund_item: EbayRefund;
    amount: number;
    item: EbayItemSold;
}