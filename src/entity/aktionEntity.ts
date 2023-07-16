import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Produkt } from './produktEntity';

@Entity('aktion')
export class Aktion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Produkt)
  @JoinTable()
  produkt: Produkt[];

  @Column({ type: 'date' })
  startdatum: Date;

  @Column({ type: 'date' })
  enddatum: Date;

  @Column({ type: 'numeric' })
  rabattProzent: number;
}
