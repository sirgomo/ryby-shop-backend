import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  ManyToOne,
  Column,
} from 'typeorm';
import { Bestellung } from './bestellungEntity';
import { ProduktInBestellung } from './productBestellungEntity';
import { Kunde } from './kundeEntity';

@Entity('product_ruckgabe')
export class ProduktRueckgabe {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Bestellung)
  bestellung: Bestellung;

  @OneToMany(
    () => ProduktInBestellung,
    (produktInBestellung) => produktInBestellung.productRucgabe,
  )
  produkte: ProduktInBestellung[];

  @ManyToOne(() => Kunde, (kunde) => kunde.ruckgabe)
  kunde: Kunde;

  @Column()
  rueckgabegrund: string;

  @Column()
  rueckgabedatum: Date;

  @Column()
  rueckgabestatus: string;
}
