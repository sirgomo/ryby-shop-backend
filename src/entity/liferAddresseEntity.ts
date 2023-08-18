import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('liefer_addresse')
export class Lieferadresse {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shipping_name: string;
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
