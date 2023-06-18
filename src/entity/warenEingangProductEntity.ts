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

@Entity()
export class WareneingangProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wareneingang, (wareneingang) => wareneingang.products)
  wareneingang: Wareneingang;

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
