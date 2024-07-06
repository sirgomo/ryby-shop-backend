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

      return await this.ebayRequest.getRequest(
        `${env.ebay_api}/sell/inventory/v1/offer?sku=${sku}`,
        this.authServ.currentToken.access_token,
      );
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  async getInventoryItemBySku(sku: string) {
    try {
      await this.authServ.checkAccessToken();

      return await this.ebayRequest.getRequest(
        `${env.ebay_api}/sell/inventory/v1/inventory_item/${sku}`,
        this.authServ.currentToken.access_token,
      );
    } catch (err) {
      return err;
    }
  }
  async getfulfillmentPolicyById(id: string) {
    try {
      await this.authServ.checkAccessToken();

      return await this.ebayRequest.getRequest(
        `${env.ebay_api}/sell/account/v1/fulfillment_policy/${id}`,
        this.authServ.currentToken.access_token,
      );
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  async updateOffer(offerId: string, offer: any) {
    try {
      await this.authServ.checkAccessToken();
      const headers = {
        'Content-Type': 'application/json',
        'Content-Language': 'de-DE',
      };
      return await this.ebayRequest.sendRequest(
        `${env.ebay_api}/sell/inventory/v1/offer/${offerId}`,
        'PUT',
        this.authServ.currentToken.access_token,
        headers,
        offer,
      );
    } catch (err) {
      console.log(err);
    }
  }
  async updateEbayInventoryItem(sku: string, item: string) {
    console.log(item);
    try {
      await this.authServ.checkAccessToken();
      const headers = {
        'Content-Type': 'application/json',
        'Content-Language': 'de-DE',
        'Accept-Language': 'de-DE',
      };
      return await this.ebayRequest.sendCreateUpdateRequest(
        `${env.ebay_api}/sell/inventory/v1/inventory_item/${sku}`,
        'PUT',
        this.authServ.currentToken.access_token,
        headers,
        item,
      );
    } catch (err) {
      console.log(err);
    }
  }
}
