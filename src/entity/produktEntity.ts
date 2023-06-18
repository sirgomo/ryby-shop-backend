import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Lieferant } from './Lieferant';
import { Stellplatz } from './Stellplatz';
import { ProduktInBestellung } from './ProduktInBestellung';
import { Kategorie } from './Kategorie';
import { WareneingangProduct } from './WareneingangProduct';
import { WarenausgangProduct } from './WarenausgangProduct';
import { Aktion } from './Aktion';
import { Reservierung } from './Reservierung';
import { Kundenbewertung } from './Kundenbewertung';

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

  @ManyToMany(() => Stellplatz)
  @JoinTable()
  lagerorte: Stellplatz[];

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
  aktion: Aktion[];

  @ManyToMany(() => Reservierung)
  @JoinTable()
  reservation: Reservierung[];

  @OneToMany(() => Kundenbewertung, (bewertung) => bewertung.produkt)
  bewertung: Kundenbewertung[];
}
