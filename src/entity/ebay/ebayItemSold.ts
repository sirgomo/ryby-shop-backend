import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EbayTransactions } from './ebayTranscations';

@Entity('ebay_item_sold')
export class EbayItemSold {
  @PrimaryGeneratedColumn()
  id: number;
  @Column('varchar', { length: 255 })
  title: string;
  @Column('varchar', { length: 255 })
  sku: string;
  @Column('int')
  quanity: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
  @ManyToOne(() => EbayTransactions, (transaction) => transaction.items)
  transaction: EbayTransactions;
}
