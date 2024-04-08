import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { EbayRefundItem } from 'src/entity/ebay/ebayRefundItem';

export class EbayRefundDto {
  id?: number;
  orderId: string;
  creationDate: boolean;
  reason: string;
  comment: string;
  amount: number;
  transaction: EbayTransactions;
  refund_items: EbayRefundItem[];
}
