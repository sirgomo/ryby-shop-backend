import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('address_kunde')
export class AdresseKunde {
  @PrimaryGeneratedColumn()
  id: number;

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
