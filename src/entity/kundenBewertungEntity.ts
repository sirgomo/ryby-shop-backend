import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Kunde } from './kundeEntity';
import { Produkt } from './produktEntity';

@Entity('kunden_bewertung')
export class Kundenbewertung {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Kunde, (kunde) => kunde.bewertungen)
  kunde: Kunde;

  @ManyToOne(() => Produkt, (produkt) => produkt.bewertung)
  produkt: Produkt;

  @Column()
  titel: string;

  @Column()
  inhalt: string;

  @Column()
  bewertung: number;

  @Column()
  datumHinzugefuegt: Date;
}
