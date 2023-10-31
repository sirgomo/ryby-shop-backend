import { Injectable } from '@nestjs/common';
import { EbayService } from '../ebay.service';
import { EbayRequest } from '../ebay.request';
import { env } from 'src/env/env';

@Injectable()
export class EbayOffersService {
    ebayRequest = new EbayRequest();
  
    constructor(private readonly authServ: EbayService) {}

    async getOfferBySku(sku: string) {
        try {
            await this.authServ.checkAccessToken();

            
        const headers = {
            'Content-Type': 'application/json',
            'Accept-Language': 'de-DE',
            'Accept-Encoding': 'application/gzip',
          }

            return await this.ebayRequest.getRequest(`${env.ebay_api}/sell/inventory/v1/offer?sku=${sku}`, this.authServ.currentToken.access_token);
          
        } catch (err) {
            console.log(err)
            return err;
        }
  
    }
}
