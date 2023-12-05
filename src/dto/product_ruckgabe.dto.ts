import { IsOptional } from "class-validator";
import { Bestellung } from "src/entity/bestellungEntity";
import { Kunde } from "src/entity/kundeEntity";
import { ProduktInBestellung } from "src/entity/productBestellungEntity";

export class Product_RuckgabeDto {
    @IsOptional()
    id?: number;
    bestellung: Bestellung;
    produkte: ProduktInBestellung[];
    kunde: Kunde;
    rueckgabegrund: string;
    rueckgabedatum?: Date;
    rueckgabestatus: string;
    amount: number;
    paypal_refund_id:string;
    paypal_refund_status: string;
    paypal_transaction_id: string;
}