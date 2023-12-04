import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Column,
} from 'typeorm';
import { Bestellung } from './bestellungEntity';
import { Produkt } from './produktEntity';
import { ProduktRueckgabe } from './productRuckgabeEntity';

@Entity('product_in_bestellung')
export class ProduktInBestellung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bestellung, (bestellung) => bestellung.produkte)
  bestellung: Bestellung;

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @Column('int')
  menge: number;

  @Column('varchar')
  color: string;
  @Column('varchar')
  color_gepackt: string;

  @Column('decimal')
  rabatt: number;

  @Column('int')
  mengeGepackt: number;

  @Column({type: 'decimal', precision: 10, scale: 2})
  verkauf_price: number;
  @Column({type: 'decimal', precision: 10, scale: 2})
  verkauf_rabat: number;
  @Column({type: 'decimal', precision: 10, scale: 2})
  verkauf_steuer: number;

  @ManyToOne(
    () => ProduktRueckgabe,
    (produktRueckgabe) => produktRueckgabe.produkte, { nullable: true}
  )
  productRucgabe: ProduktRueckgabe;
}
