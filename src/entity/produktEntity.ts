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

@Entity('produkt')
export class Produkt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
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

  @Column('tinyint')
  verfgbarkeit: boolean;

  @Column('int')
  mindestmenge: number;

  @Column('tinyint')
  aktion: boolean;

  @Column('int')
  verkaufteAnzahl: number;

  @ManyToMany(() => WareneingangProduct)
  @JoinTable()
  wareneingang: WareneingangProduct[];

  @ManyToMany(() => WarenausgangProduct)
  @JoinTable()
  warenausgang: WarenausgangProduct[];

  @Column('int')
  mehrwehrsteuer: number;

  @ManyToMany(() => Aktion)
  @JoinTable()
  promocje: Aktion[];

  @ManyToMany(() => Reservierung)
  @JoinTable()
  reservation: Reservierung[];

  @OneToMany(() => Kundenbewertung, (bewertung) => bewertung.produkt)
  bewertung: Kundenbewertung[];
}
