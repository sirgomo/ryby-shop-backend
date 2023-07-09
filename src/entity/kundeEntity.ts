import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
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

  @OneToOne(() => AdresseKunde, { cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  adresse: AdresseKunde;

  @OneToOne(() => Lieferadresse, { cascade: true })
  @JoinColumn()
  lieferadresse: Lieferadresse;

  @OneToMany(() => Bestellung, (bestellung) => bestellung.kunde)
  @JoinColumn()
  bestellungen: Bestellung[];

  @OneToMany(() => ProduktRueckgabe, (ruckgabe) => ruckgabe.kunde)
  @JoinColumn()
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
  @JoinColumn()
  bewertungen: Kundenbewertung[];
}
