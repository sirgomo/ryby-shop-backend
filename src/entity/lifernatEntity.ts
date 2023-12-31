import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Produkt } from './produktEntity';
import { AdresseKunde } from './addressEntity';
import { Stellplatze } from './stellplatzeEntity';
import { Wareneingang } from './warenEingangEntity';

@Entity('liferant')
export class Lieferant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Produkt, (produkt) => produkt.lieferant)
  produkte: Produkt[];

  @Column()
  email: string;

  @Column()
  telefon: string;

  @OneToOne(() => AdresseKunde, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  adresse: AdresseKunde;

  @Column()
  steuernummer: string;

  @Column()
  bankkontonummer: string;

  @Column()
  ansprechpartner: string;

  @Column()
  zahlart: string;

  @Column()
  umsatzsteuerIdentifikationsnummer: string;
  @OneToMany(() => Stellplatze, (stellplatz) => stellplatz.lieferant)
  stellplatz: Stellplatze[];
  @OneToMany(() => Wareneingang, (wareneingaenge) => wareneingaenge.lieferant)
  wareneingaenge: Wareneingang[];
}
