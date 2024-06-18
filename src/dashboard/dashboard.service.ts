import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bestellung } from 'src/entity/bestellungEntity';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { Repository } from 'typeorm';


@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(EbayTransactions) private readonly ebayTranRepo: Repository<EbayTransactions>,
        @InjectRepository(Bestellung) private readonly orderRepo: Repository<Bestellung>,
        @InjectRepository(Wareneingang) private readonly goodsReciRepo: Repository<Wareneingang>
    ) {}

    async getEbayTRansactionsData(year: string) {
      
        try {
            const ebay = await this.ebayTranRepo.createQueryBuilder()
            .select('SUM(price_total)', 'price_total')
            .where('YEAR(creationDate) = :year', { year })
            .getRawOne();
            const localShop = await this.orderRepo.createQueryBuilder()
            .select('SUM(gesamtwert)', 'gesamtwert')
            .where('YEAR(bestelldatum)= :year', { year })
            .getRawOne();

            return [{data: [ebay.price_total, localShop.gesamtwert]}];
        } catch (err) {
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY);
        }
    }
    async getYears() {
        try {
            const ebay = await this.ebayTranRepo.createQueryBuilder()
            .select('DISTINCT YEAR(creationDate)', 'years')
            .where('YEAR(creationDate) IS NOT NULL ORDER BY years DESC')
            .getRawMany();

            const localShop = await this.orderRepo.createQueryBuilder()
            .select('DISTINCT YEAR(bestelldatum)', 'years')
            .where('YEAR(bestelldatum) IS NOT NULL ORDER BY years DESC')
            .getRawMany();
 
            if(ebay.length > localShop.length)
                return ebay;

            return localShop;
        } catch (err) {
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY);
        }
    }
    async getEbayNettoData(year: string) {
        try {
            const items = await this.ebayTranRepo.createQueryBuilder()
            .select('SUM(price_total) AS total, SUM(price_shipping) AS shipping,SUM(price_tax) AS tax, SUM(price_discont) AS discon, SUM(ebay_fee) AS ebay_fee')
            .where('YEAR(creationDate) = :year', { year })
            .getRawOne();

            if(items.total == null)
                return [{ data: [0, 0,0, 0 ]}];
            const ship = Number(items.shipping);
            const discont = Number(items.discon);
            const total = Number(items.total);
            const fee = Number(items.ebay_fee);
            const tax = Number(items.tax);
            return [{ data: [ fee, ship + discont ,tax, total - fee - (ship + discont) - tax]}]; 

        } catch (err) {
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY);
        }
    }
    async getShopNettoData(year: string) {
        try {
        
            const items = await this.orderRepo.createQueryBuilder()
            .select('SUM(gesamtwert) as total, SUM(versandprice) as shipping, SUM(totaltax) as tax')
            .where('YEAR(bestelldatum)= :year',{ year })
            .getRawOne()

            const total = Number(items.total);
            const shipp = Number(items.shipping);
            const tax = Number(items.tax);
            if(items.total === null)
                return [{ data: [0, 0,0, 0 ]}];


            return [{data: [total, shipp, tax, total - shipp - tax]}]
        } catch (err) {
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY);
        }
    }
    async getMonths(year: string) {
        try {
            const query = `
                SELECT 
                    MONTH(creationDate) as month, 
                    SUM(price_total) as ebay_total, 
                    SUM(gesamtwert) as shop_total
                FROM (
                    SELECT creationDate, price_total, NULL as gesamtwert 
                    FROM ebay_transactions 
                    WHERE YEAR(creationDate) =?
                    UNION ALL
                    SELECT bestelldatum as creationDate, NULL as price_total, gesamtwert 
                    FROM bestellung 
                    WHERE YEAR(bestelldatum) =?
                ) as combined
                GROUP BY MONTH(creationDate)
            `;


        const result = await this.goodsReciRepo.query(query, [year, year]).catch((err) => {
            console.log(err)
        }).then((res) => {
            console.log(res);
            return res;
        });

        const ebay = Array(12).fill(0);
        const shop = Array(12).fill(0);

        result.forEach(row => {
            ebay[row.month - 1] = row.ebay_total || 0;
            shop[row.month -1] = row.shop_total || 0;
        });

        return {
            labels: [ 'Januar', 'Februar', 'März', 'April','Mai', 'Juni', 'Juli', 'August', 'September','Oktober', 'November', 'Dezember' ],
            datasets: [
                { data: ebay, label: 'Ebay' },
                { data: shop, label: 'Shop' }
            ]
        };
       
        } catch (err) {
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY); 
        }

    }
}
