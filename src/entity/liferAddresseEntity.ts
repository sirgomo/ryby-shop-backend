import { Entity, PrimaryGeneratedColumn, OneToOne, Column } from 'typeorm';
import { Kunde } from './kundeEntity';

@Entity()
export class Lieferadresse {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Kunde)
  kunde: Kunde;

  @Column()
  strasse: string;

  @Column()
  hausnummer: string;

  @Column()
  stadt: string;

  @Column()
  postleitzahl: string;

  @Column()
  land: string;
}
