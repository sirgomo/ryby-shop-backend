import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Column,
} from 'typeorm';
import { Wareneingang } from './warenEingangEntity';
import { Produkt } from './produktEntity';

@Entity('waren_eingang_product')
export class WareneingangProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wareneingang, (wareneingang) => wareneingang.products)
  wareneingang: Wareneingang;

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
