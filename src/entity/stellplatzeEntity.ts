import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Lager } from './lagerEntity';
import { Produkt } from './produktEntity';
import { Lieferant } from './lifernatEntity';

@Entity()
export class Stellplatze {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  platzid: string;

  @ManyToOne(() => Lager, (lager) => lager.lagerorte)
  lager: Lager;

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @ManyToOne(() => Lieferant, (lieferant) => lieferant.stellplatz)
  lieferant: Lieferant;

  @Column()
  menge: number;

  @Column()
  bestand: number;

  @Column()
  mhd: string;

  @Column()
  static: number;

  @Column()
  prufziffern: number;

  @Column()
  gesperrt: boolean;
}
