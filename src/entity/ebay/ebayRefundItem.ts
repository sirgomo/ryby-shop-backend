import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { EbayRefund } from "./ebayRefund";
import { EbayItemSold } from "./ebayItemSold";
@Entity('ebay_refund_item')
export class EbayRefundItem {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => EbayRefund, (refund) => refund.refund_items, {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    refund_item: EbayRefund;
    @Column({type: 'decimal', precision: 10, scale: 2})
    amount: number;
    @OneToOne(() => EbayItemSold, (item) => item.refund_item)
    @JoinColumn({name: 'ebay_item_sold'})
    item: EbayItemSold;
    
}