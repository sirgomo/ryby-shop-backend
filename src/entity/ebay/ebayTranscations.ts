import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EbayItemSold } from './ebayItemSold';
import { EbayRefund } from './ebayRefund';

@Entity('ebay_transactions')
export class EbayTransactions {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  orderId: string;
  @Column({ type: 'datetime', nullable: false })
  creationDate: Date;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_total: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_shipping: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_tax: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_discont: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ebay_fee: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ebay_advertising_cost: number;
  @Column('int')
  sel_amount: number;
  @Column('varchar', { length: 50 })
  payment_status: string;
  @OneToMany(() => EbayItemSold, (item) => item.transaction, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  items: EbayItemSold[];
  @OneToMany(() => EbayRefund, (refund) => refund.transaction, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  refunds: EbayRefund[];
  @Column({ type: 'varchar', length: 50 })
  zahlungsart: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: null})
  advertising_costs: number;
}
