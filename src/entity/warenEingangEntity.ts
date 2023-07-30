import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Lieferant } from './lifernatEntity';
import { WareneingangProduct } from './warenEingangProductEntity';

@Entity('waren_eingang')
export class Wareneingang {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => WareneingangProduct, (product) => product.wareneingang, { cascade: true, onDelete: 'CASCADE' })
  products: WareneingangProduct[];

  @ManyToOne(() => Lieferant, (lieferant) => lieferant.wareneingaenge)
  lieferant: Lieferant;

  @Column('date')
  empfangsdatum: Date;

  @Column('varchar')
  rechnung: string;

  @Column('varchar')
  lieferscheinNr: string;

  @Column('date')
  datenEingabe: Date;

  @Column('tinyint')
  gebucht: boolean;

  @Column('tinyint')
  eingelagert: boolean;
}
