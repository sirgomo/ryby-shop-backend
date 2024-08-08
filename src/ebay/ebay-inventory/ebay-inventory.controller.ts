import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayRequest } from '../ebay.request';
import { env } from 'src/env/env';
import { EbayService } from '../ebay.service';
import { ProductService } from 'src/product/product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { Request } from 'express';
import FormData from 'form-data';
import { XMLParser } from 'fast-xml-parser';

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
  //get default category id for market place
  @Get('default-category')
  async getEbayDefaultCategoryId() {
   await this.ebayServ.checkAccessToken();
   
    const respo = await this.request.getRequest(`${env.ebay_api}/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=${env.ebay_marketplaye_id}`, this.ebayServ.currentToken.access_token);
    return respo;
  }
  //get category sugestion for item
  @Get('category-sugesstions')
  async getCategoryForItem(@Query('markt') markt: number, @Query('query') query: string) {
    await this.ebayServ.checkAccessToken();
    return await this.request.getRequest(`${env.ebay_api}/commerce/taxonomy/v1/category_tree/${markt}/get_category_suggestions?q=${query}`, this.ebayServ.currentToken.access_token);
  }
  //getAspectsforCategoryId
  @Get('category-aspects')
  async getCategoryAspects(@Query('tree_id') tree_id:number, @Query('category') categoryid: number) {
    await this.ebayServ.checkAccessToken();
    return await this.request.getRequest(`${env.ebay_api}/commerce/taxonomy/v1/category_tree/${tree_id}/get_item_aspects_for_category?category_id=${categoryid}`, this.ebayServ.currentToken.access_token);
  }
  //send image to server
  @Post('post-image')
  @UseInterceptors(FileInterceptor('image', { storage: multer.memoryStorage() }))
  async postImageToEbay(@UploadedFile() image: Express.Multer.File, @Req() req: Request) {
    try {
      await this.ebayServ.checkAccessToken();
      const apiUrl = 'https://api.ebay.com/ws/api.dll'; // URL do eBay API
      if (!image || !image.originalname) {
        throw new HttpException('No file or XML Payload', HttpStatus.BAD_REQUEST);
      }
      const xmlPayload = `
      <?xml version="1.0" encoding="utf-8"?>
      <UploadSiteHostedPicturesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
          <RequesterCredentials>
              <ebl:eBayAuthToken xmlns:ebl="urn:ebay:apis:eBLBaseComponents">${this.ebayServ.currentToken.access_token}</ebl:eBayAuthToken>
          </RequesterCredentials>
          <PictureName>${image.originalname}</PictureName>
          <PictureSet>Standard</PictureSet>
          <ExtensionInDays>20</ExtensionInDays>
      </UploadSiteHostedPicturesRequest>
    `;



      const formData = new FormData();
      formData.append('XML Payload', xmlPayload, { 'contentType' : 'text/xml'});
      formData.append('image', image.buffer, { filename: image.originalname });

      const headers = {
        'X-EBAY-API-CALL-NAME': 'UploadSiteHostedPictures',
        'X-EBAY-API-SITEID': 0,
        'X-EBAY-API-RESPONSE-ENCODING': 'XML',
        'X-EBAY-API-COMPATIBILITY-LEVEL': 967,
        'X-EBAY-API-DETAIL-LEVEL': 0,
        'Cache-Control': 'no-cache'
      };
      const formHeaders = formData.getHeaders();
      const combinedHeaders = { ...headers, ...formHeaders };

      const ressponse =  await this.request.sendRequestXml(apiUrl, 'POST', combinedHeaders, formData.getBuffer());
      const parser = new XMLParser();
      let responseObject = parser.parse(ressponse);
      return responseObject;
   
    } catch (err) {
      return err;
    }
  }
  @Get('inventory-locations')
  async getInventoryLocations() {
    try {
      await this.ebayServ.checkAccessToken();
      return await this.request.getRequest(
        `${env.ebay_api}/sell/inventory/v1/location`,
        this.ebayServ.currentToken.access_token,
      );
    } catch (err) {
      console.log(err);
      return err;
    }
   
  }
  @Get('ebay-store-categories') 
  async getEbayStoreCategories() {
    
  }
}