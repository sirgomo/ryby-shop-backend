import { EbaySubscriptionDto } from "./ebaySubscriptionDto"

export class EbaySubscriptionsPayloadDto {
    total : number;
    href : string;
    next : string;
    limit : number;
    subscriptions : EbaySubscriptionDto[];
}