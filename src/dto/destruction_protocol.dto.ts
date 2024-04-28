import { IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class Destruction_protocolDTO {
    @IsOptional()
    id: number;
    @IsNumber()
    produktId: number;
    @IsNotEmpty()
    variationId: string;
    @IsNotEmpty()
    produkt_name: string;
    @IsNumber()
    quantity: number;
    @IsNotEmpty()
    type: string;
    @IsNotEmpty()
    destruction_date: Date;
    @IsNotEmpty()
    responsible_person:string;
    @IsNotEmpty()
    status: string;
    @IsOptional() 
    description: string | null;
}

export enum Destruction_Protocol_Status {
    'CLOSED',
    'OPEN',
    'ABGEBROCHEN'
}
export enum Destruction_Protocol_Type {
    'Beschädigt im Transport',
    'Gestohlen',
    'Verloren im Transport'
}