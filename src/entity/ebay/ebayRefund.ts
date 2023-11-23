import { PrimaryGeneratedColumn, Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { EbayTransactions } from "./ebayTranscations";
import { EbayRefundItem } from "./ebayRefundItem";
@Entity('ebay_refund')
export class EbayRefund {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({type: 'varchar', length: 255, nullable: false, unique: true})
    orderId: string;
    @Column({type: 'datetime', nullable: false})
    creationDate: boolean;
    @Column('varchar', {length: 500})
    reason: string;
    @Column({type: 'decimal', precision: 10, scale: 2})
    amount: number;
    @ManyToOne(() => EbayTransactions, (transaction) => transaction.refunds, { onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    transaction: EbayTransactions;
    @OneToMany(() => EbayRefundItem, (item) => item.refund_item, {cascade: true})
    refund_items: EbayRefundItem[];

}