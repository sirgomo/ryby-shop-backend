import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { env } from 'src/env/env';
import { EbayRequest, base64Encode } from './ebay.request';
import { EbayApplicationAccessTokenDto } from 'src/dto/ebay/ebayApplicationAccessToken.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { Repository } from 'typeorm';
import { PublicEbayKeyDto } from 'src/dto/ebay/publicEbayKey.dto';

@Injectable()
export class EbayService {
  request = new EbayRequest();
  currentToken: EbayApplicationAccessTokenDto =
    new EbayApplicationAccessTokenDto();
  token_vaild: number | null = null;
  refresh_token: string | null = null;
  ebay_public_key: PublicEbayKeyDto | null = null;
  ebay_public_key_time: number | null = null;
  constructor(
    @InjectRepository(CompanyDataEntity)
    private readonly repo: Repository<CompanyDataEntity>,
  ) {}

  async getEbaySoldOrders() {
    try {
      await this.checkAccessToken();
      return await this.request.getRequest(
        env.ebay_api + '/sell/fulfillment/v1/order?limit=50&offset=0',
        this.currentToken.access_token,
      );
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  async checkAccessToken() {
    //token is 7200 second valid
    if (this.token_vaild && this.token_vaild - 600 * 1000 > Date.now()) return;

    if (!this.refresh_token) {
      const token = (await this.repo.findOne({ where: { id: 1 } }))
        .ebay_refresh_token;

      if (!token)
        throw new HttpException(
          'Refresh Token not found',
          HttpStatus.NOT_FOUND,
        );

      await this.renevToken(token);
    }
  }

  //get first acces tocken
  async getAccessToken(code: string) {
    const qs = (await import('query-string')).default;

    const _body = {
      grant_type: env.ebay_default_body.grant_type,
      code: decodeURIComponent(code),
      redirect_uri: env.ebay_redirect,
    };

    const body = qs.stringify(_body);

    const encodedStr = base64Encode(
      env.ebay_app_id + ':' + env.ebay_app_secret,
    );
    const auth = 'Basic ' + encodedStr;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const res = await this.request.sendRequest(
        env.ebay_oauth_ident,
        'POST',
        auth,
        headers,
        body,
      );

      this.currentToken = res;
      if (this.currentToken.refresh_token) {
        await this.repo.update(
          { id: 1 },
          { ebay_refresh_token: this.currentToken.refresh_token },
        );
        this.token_vaild = Date.now() + res.expires_in * 1000;
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  //get refresh access token
  async renevToken(refresh_token: string) {
    const qs = (await import('query-string')).default;
    const _body = {
      grant_type: 'refresh_token',
      refresh_token: decodeURIComponent(refresh_token),
    };
    const body = qs.stringify(_body);
    const encodedStr = base64Encode(
      env.ebay_app_id + ':' + env.ebay_app_secret,
    );
    const auth = 'Basic ' + encodedStr;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const res = await this.request.sendRequest(
        env.ebay_oauth_ident,
        'POST',
        auth,
        headers,
        body,
      );
      this.currentToken.access_token = res.access_token;
      this.currentToken.expires_in = res.expires_in;
      this.token_vaild = Date.now() + res.expires_in * 1000;
    } catch (err) {
      console.log(err);
    }
  }
  //get url to accept for user consent
  async getUserConsent() {
    try {
      const scopeArr = env.ebay_default_body.scope.split(' ');
      let scope = '';
      for (let i = 0; i < scopeArr.length; i++) {
        if (i > 0) {
          scope = scope + '%20' + scopeArr[i];
        } else {
          scope = scopeArr[i];
        }
      }
      return {
        address: `${env.ebay_oauth_autorize}?client_id=${env.ebay_app_id}&redirect_uri=${env.ebay_redirect}&response_type=code&scope=${scope}&state=111sd2a1`,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
