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
import { Aktion } from './aktionEntity';
import { Kundenbewertung } from './kundenBewertungEntity';
import { EanEntity } from './eanEntity';

@Entity('produkt')
export class Produkt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('varchar')
  sku: string;

  @Column('varchar')
  ebay_group: string

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
  @JoinTable({ name: 'product_in_bestellung_produkt_produkt'})
  bestellungen: ProduktInBestellung[];

  @Column({ type: 'date' })
  datumHinzugefuegt: Date;

  @ManyToMany(() => Kategorie)
  @JoinTable()
  kategorie: Kategorie[];

  @Column('tinyint')
  verfgbarkeit: number;

  @Column('int')
  mindestmenge: number;
  @Column('int')
  currentmenge: number;
  @Column('varchar')
  product_sup_id: string;

  @Column('int')
  lange: number;
  @Column('decimal')
  gewicht: number;
  
  @Column('int')
  verkaufteAnzahl: number;

  @ManyToMany(() => WareneingangProduct)
  @JoinTable()
  wareneingang: WareneingangProduct[];


  @Column('int')
  mehrwehrsteuer: number;

  @ManyToMany(() => Aktion)
  @JoinTable()
  promocje: Aktion[];


  @OneToMany(() => Kundenbewertung, (bewertung) => bewertung.produkt)
  @JoinTable()
  bewertung: Kundenbewertung[];

  @OneToMany(() => EanEntity, (ean) => ean.product, {cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  @JoinTable()
  eans: EanEntity[];
}
