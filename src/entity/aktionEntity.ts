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
  @Column({ type: 'varchar', length: 255, nullable: false })
  aktion_key: string;
  @ManyToMany(() => Produkt, (produkt) => produkt.promocje, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'produkt_promocje_aktion' })
  produkt: Produkt[];

  @Column({ type: 'date' })
  startdatum: Date;

  @Column({ type: 'date' })
  enddatum: Date;

  @Column({ type: 'numeric' })
  rabattProzent: number;
}
