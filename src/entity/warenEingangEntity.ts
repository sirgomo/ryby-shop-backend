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

  @OneToMany(() => WareneingangProduct, (product) => product.wareneingang)
  products: WareneingangProduct[];

  @ManyToOne(() => Lieferant, (lieferant) => lieferant.wareneingaenge)
  lieferant: Lieferant;

  @Column()
  empfangsdatum: Date;

  @Column()
  rechnung: string;

  @Column()
  lieferscheinNr: string;

  @Column()
  datenEingabe: Date;
}
