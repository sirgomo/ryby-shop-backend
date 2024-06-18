import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Kunde } from './kundeEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { ProduktRueckgabe } from './productRuckgabeEntity';

@Entity('bestellung')
export class Bestellung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Kunde, (kunde) => kunde.bestellungen)
  kunde: Kunde;

  @OneToMany(
    () => ProduktInBestellung,
    (produktInBestellung) => produktInBestellung.bestellung,
    { cascade: true, onDelete: 'CASCADE' },
  )
  produkte: ProduktInBestellung[];

  @Column()
  bestelldatum: Date;

  @Column()
  status: string;

  @Column()
  versand_datum: Date;

  @Column()
  zahlungsart: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gesamtwert: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totaltax: number;

  @Column()
  zahlungsstatus: string;
  @Column({ type: 'varchar', length: 1000 })
  shipping_address_json: string;

  @Column({ type: 'varchar', nullable: false })
  bestellungstatus: string;
  @Column({ type: 'varchar', nullable: false })
  versandart: string;
  @Column({ type: 'decimal', nullable: false })
  versandprice: number;
  @Column({ type: 'varchar' })
  varsandnr: string;
  @Column({ type: 'varchar', length: 255 })
  paypal_order_id: string;

  @OneToMany(() => ProduktRueckgabe, (refunds) => refunds.bestellung)
  refunds: ProduktRueckgabe[];
}

export enum BESTELLUNGSSTATUS {
  INBEARBEITUNG = 'INBEARBEITUNG',
  VERSCHICKT = 'VERSCHICKT',
}

export enum BESTELLUNGSSTATE {
  ABGEBROCHEN = 'ABGEBROCHEN',
  BEZAHLT = 'BEZAHLT',
  COMPLETE = 'COMPLETE',
  ARCHIVED = 'ARCHIVED',
}
