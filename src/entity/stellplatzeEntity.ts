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

@Entity('stellplatze')
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

  @Column('int')
  menge: number;

  @Column('int')
  bestand: number;

  @Column()
  mhd: Date;

  @Column('tinyint')
  static: number;

  @Column('int')
  prufziffern: number;

  @Column('tinyint')
  gesperrt: boolean;
}
