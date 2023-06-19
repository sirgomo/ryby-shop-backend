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

  @Column('decimal')
  rabatt: number;

  @Column('int')
  mengeGepackt: number;

  @ManyToOne(
    () => ProduktRueckgabe,
    (produktRueckgabe) => produktRueckgabe.produkte,
  )
  productRucgabe: ProduktRueckgabe;
}
