import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Kunde } from './kundeEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Reservierung } from './reservierungEntity';


@Entity('bestellung')
export class Bestellung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Kunde, (kunde) => kunde.bestellungen)
  kunde: Kunde;

  @OneToMany(
    () => ProduktInBestellung,
    (produktInBestellung) => produktInBestellung.bestellung,
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

  @OneToOne(() => Reservierung, (reservierung) => reservierung.bestellung)
  reservation: Reservierung;
 
}

export enum BESTELLUNGSSTATUS {
  INBEARBEITUNG = 'INBEARBEITUNG',
  VERSCHICKT = 'VERSCHICKT',
}
