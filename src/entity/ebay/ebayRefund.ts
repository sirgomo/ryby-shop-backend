import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { EbayTransactions } from './ebayTranscations';
import { EbayRefundItem } from './ebayRefundItem';
@Entity('ebay_refund')
export class EbayRefund {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255, nullable: false })
  orderId: string;
  @Column({ type: 'datetime', nullable: false })
  creationDate: boolean;
  @Column('varchar', { length: 100 })
  reason: string;
  @Column('varchar', { length: 500 })
  comment: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
  @ManyToOne(() => EbayTransactions, (transaction) => transaction.refunds)
  transaction: EbayTransactions;
  @OneToMany(() => EbayRefundItem, (item) => item.refund, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  refund_items: EbayRefundItem[];
}
