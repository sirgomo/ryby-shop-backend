import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { groupBy } from 'rxjs';
import { Bestellung } from 'src/entity/bestellungEntity';
import { EbayItemSold } from 'src/entity/ebay/ebayItemSold';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { WareneingangProdVartiaion } from 'src/entity/waren_eingang_prod_variation';
import { env } from 'src/env/env';
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
            .where('YEAR(creationDate) ORDER BY years DESC')
            .getRawMany();

            const localShop = await this.orderRepo.createQueryBuilder()
            .select('DISTINCT YEAR(bestelldatum)', 'years')
            .where('YEAR(bestelldatum) ORDER BY years DESC')
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
            const items = await this.ebayTranRepo.createQueryBuilder('transactions')
            .select(`
            transactions.id,
            transactions.price_total AS total, 
            transactions.price_shipping AS shipping,
            transactions.price_tax AS tax, 
            transactions.price_discont AS discon, 
            transactions.ebay_fee AS ebay_fee,
            items.quanity as quantity,
            items.id as itemId,
            items.sku,
            variations.price_in_euro as peuro,
            variations.quanity_sold_at_once as quantity_at_once
            `)
            .leftJoin('ebay_item_sold', 'items', 'items.transactionId = transactions.id')
            .leftJoin('waren_eingang_prod_variation', 'variations', 'items.sku = variations.sku')
            .where('YEAR(transactions.creationDate) = :year', { year })
            .getRawMany();
            const uniqueArray = [];
            for (let i = 0; i < items.length; i++) {

                const ind = uniqueArray.findIndex((item) => item.id === items[i].id)
                if(ind !== -1)
                    uniqueArray[ind].products.push(items[i]);
                else
                uniqueArray.push({
            ...items[i],
            products: [items[i]],
            });

            }
            const yearNow = new Date(Date.now()).getFullYear();

            let month = new Date(Date.now()).getMonth();
            if(yearNow > Number(year))
                month = 11;
    
            const abo_cost = env.ebay_abbo_cost * ( month + 1);
    
    


            let ship = 0;
            let discont = 0;
            let total = 0;
            let fee = 0;
            let tax = 0;
            let goods = 0;

            for (let i = 0; i < uniqueArray.length; i++) {
                ship += Number(uniqueArray[i].shipping);
                discont += Number(uniqueArray[i].discon);
                total += Number(uniqueArray[i].total);
                fee += Number(uniqueArray[i].ebay_fee);
                tax += Number(uniqueArray[i].tax);
                
                for (let j= 0; j < uniqueArray[i].products.length; j++) {
                    goods += ((Number(uniqueArray[i].products[j].peuro) * Number(uniqueArray[i].products[j].quantity_at_once)) * Number(uniqueArray[i].products[j].quantity));
                }

            }
  
            return [{ data: [ fee + abo_cost, 
                            ship + discont,
                            tax, 
                            goods,
                            total - fee - (ship + discont) - tax - abo_cost - goods
                            ]}]; 

        } catch (err) {
            console.log(err);
            throw new HttpException('Something goes wrong, ' + err.message, HttpStatus.BAD_GATEWAY);
        }
    }
    async getShopNettoData(year: string) {
        try {

            const items = await this.orderRepo.createQueryBuilder('orders')
            .select(` DISTINCT
                  orders.id,
                  orders.gesamtwert as total,
                  orders.versandprice as shipping,
                  orders.totaltax as tax,
                  orders.status,
                  produkte.id as productId,
                  produkte.bestellungId,
                  produkte.color as color,
                  produkte.menge as menge,
                  vari.price_in_euro as peuro,
                  vari.quanity_sold_at_once as squantity
                  `)
            .leftJoin('product_in_bestellung', 'produkte', 'produkte.bestellungId = orders.id')
            .leftJoin('waren_eingang_prod_variation', 'vari', 'vari.sku = color')
            .where('YEAR(orders.bestelldatum)= :year',{ year })
            .andWhere('orders.status NOT IN (:excludedStatus)', { excludedStatus: ['ABGEBROCHEN'] })
            .groupBy('orders.id, produkte.color,produkte.menge, vari.price_in_euro, vari.quanity_sold_at_once, produkte.id, produkte.bestellungId')
            .getRawMany();

      
            const uniqueArray = [];
            for (let i = 0; i < items.length; i++) {
                const ind = uniqueArray.findIndex((item) => item.id === items[i].id);
                if(ind !== -1)
                    uniqueArray[ind].produkts.push(items[i]);
                else
                uniqueArray.push({
                    ...items[i],
                    produkts: [items[i]]
                    });
            }
              
                let shipp = 0;
                let total = 0;
                let tax = 0;
                let item_price = 0;
            if(items.length == 0)
                return [{ data: [0, 0, 0, 0, 0 ]}];

            for (let i = 0; i < uniqueArray.length; i++) {
                shipp += Number(uniqueArray[i].shipping);
                total += Number(uniqueArray[i].total);
                tax += Number(uniqueArray[i].tax);
                for (let j = 0; j < uniqueArray[i].produkts.length; j++) {
                    item_price += (Number(uniqueArray[i].produkts[j].menge) * (Number(uniqueArray[i].produkts[j].peuro) * Number(uniqueArray[i].produkts[j].squantity)));
                }
                
            }


            return [{data: [total, shipp, tax, item_price, total - shipp - tax - item_price]}];
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
