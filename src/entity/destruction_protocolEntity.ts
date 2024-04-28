import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('destruction_protocol')
export class Destruction_protocolEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    produktId: number;

    @Column()
    variationId: string;

    @Column()
    produkt_name: string;

    @Column()
    quantity: number;

    @Column()
    type: string;

    @Column()
    destruction_date: Date;

    @Column()
    responsible_person:string;

    @Column()
    status: string;

    @Column({ type: "text", nullable: true })
    description: string | null;
}