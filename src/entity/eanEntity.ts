import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Produkt } from "./produktEntity";

@Entity('ean')
export class EanEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    eanCode: string;

    @ManyToOne(() => Produkt, (product) => product.eans)
    product: Produkt;
}