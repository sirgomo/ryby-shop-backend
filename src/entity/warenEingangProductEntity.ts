import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Wareneingang } from './warenEingangEntity';
import { Produkt } from './produktEntity';
import { WareneingangProdVartiaion } from './waren_eingang_prod_variation';

@Entity('waren_eingang_product')
export class WareneingangProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wareneingang, (wareneingang) => wareneingang.products)
  wareneingang: Wareneingang;

  @ManyToMany(() => Produkt, (products) => products.wareneingang)
  @JoinTable()
  produkt: Produkt[];

  @OneToMany(() => WareneingangProdVartiaion, (vari) => vari.waren_eingang_product, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  product_variation: WareneingangProdVartiaion[];

}
