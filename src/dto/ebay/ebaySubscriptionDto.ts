export class EbaySubscriptionDto {
    subscriptionId : string;
    topicId : string;
    status : SubscriptionStatusEnum;
    creationDate : string;
    payload :
            { /* SubscriptionPayloadDetail */
            format : [FormatTypeEnum];
            schemaVersion : string;
            deliveryProtocol : ProtocolEnum;
            };
    destinationId : string;
    filterId : string;
}

export enum SubscriptionStatusEnum {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED'
}
export enum FormatTypeEnum {
    JSON = 'JSON',
}
export enum ProtocolEnum {
    HTTPS = 'HTTPS',
}