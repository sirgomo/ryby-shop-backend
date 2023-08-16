import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Kunde } from './kundeEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Reservierung } from './reservierungEntity';
import { Lieferadresse } from './liferAddresseEntity';

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

  @OneToOne(() => Reservierung, (reservierung) => reservierung.bestellung)
  reservation: Reservierung;
 
  @OneToOne(() => Lieferadresse)
  @JoinColumn()
  shipping_addresse: Lieferadresse;
}
