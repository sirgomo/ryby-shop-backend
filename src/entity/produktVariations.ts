import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Produkt } from "./produktEntity";
@Entity('variations')
export class ProduktVariations {
    @PrimaryColumn({ type: 'varchar', nullable: false, unique: true, length: 500 })
    sku: string
    @ManyToOne(() => Produkt, (prod) => prod.variations )
    @JoinColumn({name: 'produktId'})
    produkt: Produkt;

    @Column({ type: 'varchar', length: 255})
    variations_name: string;
    @Column({ type: 'varchar', length: 255})
    hint: string;
    @Column({ type: 'varchar', length: 255 })
    value: string;
    //gewicht
    @Column({ type: 'varchar', length: 255})
    unit: string;
    @Column({ type: 'varchar', length: 1000})
    image: string;
    @Column('decimal')
    price: number;
    @Column({ type: 'varchar', length: 1000})
    thumbnail: string;
    @Column('int')
    quanity: number;
    @Column('int')
    quanity_sold: number;

}