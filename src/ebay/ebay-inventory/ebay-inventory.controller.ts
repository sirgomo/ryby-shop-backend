import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayRequest } from '../ebay.request';
import { env } from 'src/env/env';
import { EbayService } from '../ebay.service';
import { ProductService } from 'src/product/product.service';

@Controller('ebay-inventory')
@UseGuards(JwtAuthGuard)
export class EbayInventoryController {
  request = new EbayRequest();
  constructor(
    private readonly ebayServ: EbayService,
    private readonly productService: ProductService,
  ) {}
  //get item from base by sku, return from mysql
  @Get('/sku/:id')
  async getProduktBeiId(@Param('id') sku: string) {
    return this.productService.getProduktBeiSku(sku);
  }
  //get item by group sku, it should be item group ?, return from mysql
  @Get('/group/:id')
  async getProuktBeiEbay_Group(@Param('id') group: string) {
    return this.productService.getProduktBeiEbayGroup(group);
  }
  //get items from ebay inventory, limit max 100 and offset
  @Get('/:limit/:offset')
  async getCurrentListedItems(
    @Param('limit') limit: number,
    @Param('offset') offset: number,
  ) {
    try {
      await this.ebayServ.checkAccessToken();

      if (offset == 0) {
        return await this.request.getRequest(
          `${env.ebay_api}/sell/inventory/v1/inventory_item?limit=${limit}&offset=${offset}`,
          this.ebayServ.currentToken.access_token,
        );
      } else {
        return await this.request.getRequest(
          `${env.ebay_api}/sell/inventory/v1/inventory_item?offset=${offset}&limit=${limit}`,
          this.ebayServ.currentToken.access_token,
        );
      }
    } catch (err) {
      return err;
    }
  }
  //add items to inventory on listing id from ebay (if item was first on ebay and later we wanna them in shop)
  @Post('/listing')
  async importItmsToInventory(@Body() payload: { listings: string }) {
    try {
      await this.ebayServ.checkAccessToken();

      const headers = {
        'Content-Type': 'application/json',
        'Accept-Language': 'de-DE',
        'Accept-Encoding': 'application/gzip',
      };

      const items = payload.listings.split(',');
      const tmpItem: { listingId: string }[] = [];
      for (let i = 0; i < items.length; i++) {
        tmpItem.push({ listingId: items[i] });
      }
      const item = { requests: tmpItem };
      const auth = 'Bearer ' + this.ebayServ.currentToken.access_token;

      return await this.request.sendRequest(
        `${env.ebay_api}/sell/inventory/v1/bulk_migrate_listing`,
        'POST',
        auth,
        headers,
        JSON.stringify(item),
      );
    } catch (err) {
      return err;
    }
  }
  @Get('/ebay/groupid/:id')
  async getEbayGroupOfItems(@Param('id') id: string) {
    try {
      await this.ebayServ.checkAccessToken();

      return await this.request.getRequest(
        `${env.ebay_api}/sell/inventory/v1/inventory_item_group/${id}`,
        this.ebayServ.currentToken.access_token,
      );
    } catch (err) {
      return err;
    }
  }
  @Get('/ebay/sku/:id')
  async getEbayOneSku(@Param('id') id: string) {
    try {
      await this.ebayServ.checkAccessToken();

      return await this.request.getRequest(
        `${env.ebay_api}/sell/inventory/v1/inventory_item/${id}`,
        this.ebayServ.currentToken.access_token,
      );
    } catch (err) {
      return err;
    }
  }
}
