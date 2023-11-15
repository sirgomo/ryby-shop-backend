import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Lieferant } from './lifernatEntity';
import { WareneingangProduct } from './warenEingangProductEntity';
import { Lager } from './lagerEntity';

@Entity('waren_eingang')
export class Wareneingang {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => WareneingangProduct, (product) => product.wareneingang, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  products: WareneingangProduct[];

  @ManyToOne(() => Lieferant, (lieferant) => lieferant.wareneingaenge)
  lieferant: Lieferant;

  @Column('datetime')
  empfangsdatum: Date;

  @Column('varchar')
  rechnung: string;

  @Column('varchar')
  lieferscheinNr: string;

  @Column('datetime')
  datenEingabe: Date;

  @Column('tinyint')
  gebucht: boolean;

  @Column('tinyint')
  eingelagert: boolean;

  @Column('decimal')
  shipping_cost: number;

  @Column('varchar')
  remarks: string;

  @Column('decimal')
  other_cost: number;

  @ManyToOne(() => Lager, (lager) => lager.wareneingang)
  location: Lager

  @Column({type: 'varchar', default: 'EUR', length: 3})
  wahrung: string;
  @Column({type: 'varchar', default: 'EUR', length: 3})
  wahrung2: string;
  @Column({type: 'decimal', default: 1.0, precision: 10, scale: 4})
  wahrung_rate: number;

  @Column('decimal')
  shipping_cost_eur: number;
  
  @Column('decimal')
  other_cost_eur: number;
}
