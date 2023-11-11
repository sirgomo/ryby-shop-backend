import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('shipping_costs')
export class ShippingEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ length: 255, type: 'varchar' })
    shipping_name: string;
    @Column({ type: 'decimal', length: 10, precision: 2 })
    shipping_price: number;
    @Column({ type: 'decimal', length: 10, precision: 2 })
    average_material_price: number;
}   