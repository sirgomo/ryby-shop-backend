import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Produkt } from './produktEntity';

@Entity('shipping_costs')
export class ShippingEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 255, type: 'varchar' })
  shipping_name: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shipping_price: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  average_material_price: number;
  @ManyToMany(() => Produkt, (produkt) => produkt.shipping_costs)
  produkt: Produkt[];
  @Column({ type: 'decimal', scale: 2, precision: 10 })
  cost_per_added_stuck: number;
}
