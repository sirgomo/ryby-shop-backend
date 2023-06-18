import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Bestellung } from './bestellungEntity';
import { WarenausgangProduct } from './warenAusgangProductEntity';

@Entity()
export class Warenausgang {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Bestellung, (bestellung) => bestellung.produkte)
  bestellung: Bestellung;

  @Column()
  ausgangsdatum: Date;

  @OneToMany(
    () => WarenausgangProduct,
    (warenausgangProduct) => warenausgangProduct.warenenausgang,
  )
  products: WarenausgangProduct[];

  @Column()
  rechnung: string;

  @Column()
  datenEingabe: Date;

  @Column()
  zahlungsstatus: string;
}
