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

@Entity()
export class ProduktInBestellung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bestellung, (bestellung) => bestellung.produkte)
  bestellung: Bestellung;

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @Column()
  menge: number;

  @Column()
  preis: number;

  @Column()
  rabatt: number;

  @Column()
  wert: number;

  @Column()
  mengeVerpackt: number;

  @ManyToOne(
    () => ProduktRueckgabe,
    (produktRueckgabe) => produktRueckgabe.produkte,
  )
  productRucgabe: ProduktRueckgabe;
}
