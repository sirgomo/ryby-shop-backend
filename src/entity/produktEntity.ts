import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Lieferant } from './lifernatEntity';
import { Stellplatze } from './stellplatzeEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Kategorie } from './kategorieEntity';
import { WareneingangProduct } from './warenEingangProductEntity';
import { WarenausgangProduct } from './warenAusgangProductEntity';
import { Aktion } from './promocjeEntity';
import { Reservierung } from './reservierungEntity';
import { Kundenbewertung } from './kundenBewertungEntity';

@Entity()
export class Produkt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  preis: number;

  @Column()
  beschreibung: string;

  @Column()
  foto: string;

  @Column()
  thumbnail: string;

  @ManyToOne(() => Lieferant, (lieferant) => lieferant.produkte)
  lieferant: Lieferant;

  @ManyToMany(() => Stellplatze)
  @JoinTable()
  lagerorte: Stellplatze[];

  @ManyToMany(() => ProduktInBestellung)
  @JoinTable()
  bestellungen: ProduktInBestellung[];

  @Column({ type: 'date' })
  datumHinzugefuegt: Date;

  @ManyToMany(() => Kategorie)
  @JoinTable()
  kategorie: Kategorie[];

  @Column()
  verfgbarkeit: boolean;

  @Column()
  mindestmenge: number;

  @Column()
  aktion: boolean;

  @Column()
  verkaufteAnzahl: number;

  @ManyToMany(() => WareneingangProduct)
  @JoinTable()
  wareneingang: WareneingangProduct[];

  @ManyToMany(() => WarenausgangProduct)
  @JoinTable()
  warenausgang: WarenausgangProduct[];

  @Column()
  mehrwehrsteuer: boolean;

  @ManyToMany(() => Aktion)
  @JoinTable()
  promocje: Aktion[];

  @ManyToMany(() => Reservierung)
  @JoinTable()
  reservation: Reservierung[];

  @OneToMany(() => Kundenbewertung, (bewertung) => bewertung.produkt)
  bewertung: Kundenbewertung[];
}
