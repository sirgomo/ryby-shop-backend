import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Lieferant } from './lifernatEntity';
import { Stellplatze } from './stellplatzeEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Kategorie } from './kategorieEntity';
import { WareneingangProduct } from './warenEingangProductEntity';
import { WarenausgangProduct } from './warenAusgangProductEntity';
import { Aktion } from './aktionEntity';
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

  @Column({ unique: true, nullable: false, type: 'int' })
  artid: number;

  @Column()
  beschreibung: string;
  
  @Column()
  color: string;

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
  @Column('int')
  currentmenge: number;
  @Column('varchar')
  product_sup_id: string;

  @Column('int')
  lange: number;
  @Column('int')
  gewicht: number;


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
  @JoinTable()
  bewertung: Kundenbewertung[];
}
