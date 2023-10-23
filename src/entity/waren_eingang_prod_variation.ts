import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { WareneingangProduct } from "./warenEingangProductEntity";

@Entity('waren_eingang_prod_variation')
export class WareneingangProdVartiaion {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    sku: string;
    @Column('int')
    quanity: number;
  
    @Column('decimal')
    price: number;
  
    @Column('int')
    mwst: number;
    @Column('int')
    quanity_stored: number;
    @ManyToOne(() => WareneingangProduct, (prod) => prod.product_variation)
    @JoinColumn({name: 'waren_eingang_productId'})
    waren_eingang_product: WareneingangProduct;
}