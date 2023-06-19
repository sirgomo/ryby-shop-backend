import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { AdresseKunde } from './addressEntity';
import { Lieferadresse } from './liferAddresseEntity';
import { Bestellung } from './bestellungEntity';
import { Kundenbewertung } from './kundenBewertungEntity';
import { ProduktRueckgabe } from './productRuckgabeEntity';

@Entity('kunde')
export class Kunde {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vorname: string;

  @Column()
  nachname: string;
  @Column()
  password: string;

  @OneToOne(() => AdresseKunde)
  adresse: AdresseKunde;

  @OneToOne(() => Lieferadresse)
  lieferadresse: Lieferadresse;

  @OneToMany(() => Bestellung, (bestellung) => bestellung.kunde)
  bestellungen: Bestellung[];

  @OneToMany(() => ProduktRueckgabe, (ruckgabe) => ruckgabe.kunde)
  ruckgabe: Bestellung[];

  @Column()
  email: string;

  @Column()
  telefon: string;
  @Column()
  role: string;

  @Column()
  registrierungsdatum: Date;

  @Column()
  treuepunkte: number;

  @OneToMany(() => Kundenbewertung, (bewertung) => bewertung.kunde)
  bewertungen: Kundenbewertung[];
}
