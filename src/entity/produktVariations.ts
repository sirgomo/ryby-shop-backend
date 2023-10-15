import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Produkt } from "./produktEntity";
@Entity('variations')
export class ProduktVariations {
    @PrimaryColumn({ type: 'varchar', nullable: false, unique: true, length: 500 })
    sku: string
    @ManyToOne(() => Produkt, (prod) => prod.variations )
    produkt: Produkt;

    @Column({ type: 'varchar', length: 255})
    variations_name: string;
    @Column({ type: 'varchar', length: 255})
    hint: string;
    @Column({ type: 'varchar', length: 255 })
    value: string;
    @Column({ type: 'varchar', length: 255})
    unit: string;
    @Column({ type: 'varchar', length: 1000})
    image: string;
}