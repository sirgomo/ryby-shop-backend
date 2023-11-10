import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { Lieferant } from './lifernatEntity';
import { Stellplatze } from './stellplatzeEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Kategorie } from './kategorieEntity';
import { WareneingangProduct } from './warenEingangProductEntity';
import { Aktion } from './aktionEntity';
import { Kundenbewertung } from './kundenBewertungEntity';
import { EanEntity } from './eanEntity';
import { ProduktVariations } from './produktVariations';

@Entity('produkt')
export class Produkt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('varchar')
  sku: string;



  @Column({ unique: true, nullable: false, type: 'int' })
  artid: number;

  @Column()
  beschreibung: string;

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

  @Column('varchar')
  product_sup_id: string;

  @Column({type: 'tinyint', default: 0 })
  ebay:number;


  @ManyToMany(() => WareneingangProduct, (products) => products.produkt)
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

  @OneToMany(() => ProduktVariations, (vari) => vari.produkt, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  @JoinTable()
  variations: ProduktVariations[];
  @Column('varchar')
  produkt_image: string;
}
