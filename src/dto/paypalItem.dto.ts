import { SubjectLike } from "rxjs";

export class PaypalItem {
    name: string;
    quantity: number;
    description?: string;
    sku?: string;
    category = 'PHYSICAL_GOODS';
    unit_amount? : {
        currency_code : 'EUR',
        value: number,
    }
    tax? : {
        currency_code : 'EUR',
        value: number,
    }
}