import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  Column,
} from 'typeorm';
import { Bestellung } from './bestellungEntity';
import { Produkt } from './produktEntity';

@Entity('reservierung')
export class Reservierung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Bestellung)
  @JoinTable()
  bestellung: Bestellung[];

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @Column()
  color_menge: string;
}
