import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { Kunde } from './kundeEntity';
import { ProduktInBestellung } from './productBestellungEntity';



@Entity('bestellung')
export class Bestellung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Kunde, (kunde) => kunde.bestellungen)
  kunde: Kunde;

  @OneToMany(
    () => ProduktInBestellung,
    (produktInBestellung) => produktInBestellung.bestellung,  { cascade: true, onDelete: 'CASCADE'}
  )
  produkte: ProduktInBestellung[];

  @Column()
  bestelldatum: Date;

  @Column()
  status: string;

  @Column()
  lieferdatum: Date;

  @Column()
  zahlungsart: string;

  @Column('decimal')
  gesamtwert: number;

  @Column()
  zahlungsstatus: string;

  @Column({ type: 'varchar', nullable: false})
  bestellungstatus: string;
  @Column({ type: 'varchar', nullable: false})
  versandart: string;
  @Column({type: 'decimal', nullable: false })
  versandprice: number;
 
}

export enum BESTELLUNGSSTATUS {
  INBEARBEITUNG = 'INBEARBEITUNG',
  VERSCHICKT = 'VERSCHICKT',
}
