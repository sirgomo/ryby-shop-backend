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

@Entity('waren_ausgang_product')
export class WarenausgangProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Warenausgang, (wareneingang) => wareneingang.products)
  warenausgang: Warenausgang;

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @Column('int')
  menge: number;

  @Column('decimal')
  preis: number;

  @Column('int')
  mwst: number;
}
