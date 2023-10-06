import { FormatTypeEnum, ProtocolEnum } from "./ebaySubscriptionDto";

export class EbayTopicDto {
    topicId : string;
    description : string;
authorizationScopes : string[];
status : StatusEnum;
context : ContextEnum;
scope : ScopeEnum;
supportedPayloads : [
    { /* PayloadDetail */
    schemaVersion : string;
    format : [FormatTypeEnum],
    deliveryProtocol : ProtocolEnum;
    deprecated : boolean;
    }
];
filterable : boolean;
}
export enum StatusEnum {
    ENABLED = 'ENABLED',
    DISABLED = 'DISABLED',
    DEPRECATED = 'DEPRECATED'
}
export enum ContextEnum {
    BUY = 'BUY',
    SELL = 'SELL',
    COMMERCE = 'COMMERCE',
    DEVELOPER = 'DEVELOPER',
}
export enum ScopeEnum {
    APPLICATION = 'APPLICATION',
    USER = 'USER'
}
