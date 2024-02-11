import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Produkt } from './produktEntity';

@Entity('kategorie')
export class Kategorie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column()
  name: string;

  @ManyToMany(() => Produkt)
  @JoinTable({ name: 'produkt_kategorie_kategorie' })
  products: Produkt[];
}
