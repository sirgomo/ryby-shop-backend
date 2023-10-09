import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayRequest } from '../ebay.request';
import { env } from 'src/env/env';
import { EbayService } from '../ebay.service';

@Controller('ebay-inventory')
export class EbayInventoryController {

    request = new EbayRequest();
    constructor (private readonly ebayServ: EbayService) {}
  
    @Get('/:limit/:offset')
    @UseGuards(JwtAuthGuard)
    async getCurrentListedItems(@Param('limit') limit: number, @Param('offset') offset: number) {
        try {
            await this.ebayServ.checkAccessToken();

          if(offset == 0) {
            return await this.request.getRequest(`${env.ebay_api}/sell/inventory/v1/inventory_item?limit=${limit}&offset=${offset}`, this.ebayServ.currentToken.access_token);
          } else {
            return await this.request.getRequest(`${env.ebay_api}/sell/inventory/v1/inventory_item?offset=${offset}&limit=${limit}`, this.ebayServ.currentToken.access_token);
          }
   
        } catch (err) {
            return err;
        }
    }
    @Post('/listing')
    @UseGuards(JwtAuthGuard)
    async importItmsToInventory(@Body() payload: { listings: string}) {
      try {
        await this.ebayServ.checkAccessToken();

        const headers = {
          'Content-Type': 'application/json',
          'Accept-Language': 'de-DE',
          'Accept-Encoding': 'application/gzip',
        }

        const items = payload.listings.split(',');
        const tmpItem : { listingId : string }[] = [];
        for (let i = 0; i < items.length; i++) {
          tmpItem.push({listingId: items[i]});
        }
        const item = { requests: tmpItem } 
        const auth = 'Bearer '+this.ebayServ.currentToken.access_token;

        return await this.request.sendRequest(`${env.ebay_api}/sell/inventory/v1/bulk_migrate_listing`, 'POST', auth , headers, JSON.stringify(item));
      } catch (err) {
        return err;
      }
    }
}
