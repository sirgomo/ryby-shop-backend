import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Column,
} from 'typeorm';
import { Warenausgang } from './warenAusgangEntity';
import { Produkt } from './produktEntity';

@Entity()
export class WarenausgangProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warenausgang, (wareneingang) => wareneingang.products)
  warenausgang: Warenausgang;

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @Column()
  menge: number;

  @Column()
  preis: number;

  @Column()
  mwst: number;
}
