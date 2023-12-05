import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  Column,
} from 'typeorm';
import { Bestellung } from './bestellungEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Kunde } from './kundeEntity';

@Entity('product_ruckgabe')
export class ProduktRueckgabe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bestellung, (bestellung) => bestellung.refunds)
  bestellung: Bestellung;

  @OneToMany(
    () => ProduktInBestellung,
    (produktInBestellung) => produktInBestellung.productRucgabe, { nullable : true}
  )
  produkte: ProduktInBestellung[];

  @ManyToOne(() => Kunde, (kunde) => kunde.ruckgabe)
  kunde: Kunde;

  @Column()
  rueckgabegrund: string;

  @Column()
  rueckgabedatum: Date;

  @Column()
  rueckgabestatus: string;
  @Column({type: 'decimal', precision: 10, scale: 2})
  amount: number;
  @Column('varchar')
  paypal_refund_id: string;
  @Column('varchar')
  paypal_refund_status:string;
  @Column('varchar')
  paypal_transaction_id:string;
}

export enum RUECKGABESTATUS {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND'
}
