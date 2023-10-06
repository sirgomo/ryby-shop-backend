import { EbayTopicDto } from "./ebayTopic.dto";

export class EbayTopicsPayloadDto {
    total : number;
    href : string;
    next : string;
    limit : number;
    topics: EbayTopicDto[];
}