import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Produkt } from './produktEntity';

@Entity()
export class Kategorie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parent_id: number;

  @Column()
  name: string;

  @ManyToMany(() => Produkt)
  @JoinTable()
  products: Produkt[];

  @ManyToOne(() => Kategorie, { nullable: true })
  parent: Kategorie;
}
