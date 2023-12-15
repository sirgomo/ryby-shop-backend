import { EbayRefund } from 'src/entity/ebay/ebayRefund';

export class EbayRefundItemDto {
  id?: number;
  refund_item: EbayRefund;
  amount: number;
  sku: string;
  item_quanity: number;
}
