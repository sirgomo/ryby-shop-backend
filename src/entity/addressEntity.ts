import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Kunde } from './kundeEntity';

@Entity()
export class AdresseKunde {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Kunde)
  @JoinColumn()
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
