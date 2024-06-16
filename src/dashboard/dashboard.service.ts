import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bestellung } from 'src/entity/bestellungEntity';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { Equal, LessThan, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { DateUtils } from 'typeorm/util/DateUtils.js';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(EbayTransactions) private readonly ebayTranRepo: Repository<EbayTransactions>,
        @InjectRepository(Bestellung) private readonly orderRepo: Repository<Bestellung>,
        @InjectRepository(Wareneingang) private readonly goodsReciRepo: Repository<Wareneingang>
    ) {}

    async getEbayTRansactionsData(year: string) {
        console.log('ye ' + year);
        try {
            const date = new Date(year);
            const ebay = await this.ebayTranRepo.createQueryBuilder()
            .select('SUM(price_total)', 'price_total')
            .where('YEAR(creationDate)='+year)
            .getRawOne();
            const localShop = await this.orderRepo.createQueryBuilder()
            .select('SUM(gesamtwert)', 'gesamtwert')
            .where('YEAR(bestelldatum)='+year)
            .getRawOne();

            return [{data: [ebay.price_total, localShop.gesamtwert]}];
        } catch (err) {
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY);
        }
    }
    async getYears() {

    }
}
