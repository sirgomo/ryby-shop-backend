import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EbayRefund } from './ebayRefund';
@Entity('ebay_refund_item')
export class EbayRefundItem {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => EbayRefund, (refund) => refund.refund_items, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  refund: EbayRefund;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
  @Column('varchar')
  sku: string;
  @Column('int')
  item_quanity: number;
}
