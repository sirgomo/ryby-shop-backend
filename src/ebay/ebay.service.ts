import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { env } from 'src/env/env';
import { EbayRequest, base64Encode } from './ebay.request';
import { EbayApplicationAccessTokenDto } from 'src/dto/ebayApplicationAccessToken.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { Repository } from 'typeorm';
@Injectable()
export class EbayService {
  request = new EbayRequest();
  currentToken: EbayApplicationAccessTokenDto = new EbayApplicationAccessTokenDto();
  token_vaild: number | null = null;
  refresh_token: string | null = null;
    constructor(@InjectRepository(CompanyDataEntity) private readonly repo: Repository<CompanyDataEntity>) {}



    async getEbaySoldOrders() {
      try {
        
        if(!this.refresh_token) {
            const token = (await this.repo.findOne({where: { id: 1 }})).ebay_refresh_token;

            if(!token)
                throw new HttpException('Refresh Token not found', HttpStatus.NOT_FOUND);

            await this.renevToken(token);
        }
        return await this.request.getRequest(env.ebay_api+'/sell/fulfillment/v1/orders', this.currentToken.access_token );

        } catch (err) {
            console.log(err);
            return err;
        }
        
    }
    //get first acces tocken
    async getAccessToken(code: string) {
        const qs = (await import('query-string')).default;

          const _body = { 
            grant_type: env.ebay_default_body.grant_type,
            code: decodeURIComponent(code),
            redirect_uri: env.ebay_redirect
          }
       
          const body = qs.stringify(_body);
      
        const encodedStr = base64Encode(env.ebay_app_id + ':' + env.ebay_app_secret);
        const auth = 'Basic ' + encodedStr;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
 
        try {
           const res =  await this.request.sendRequest(env.ebay_oauth_ident, 'POST', auth, headers, body);
         
           this.currentToken = res;
          if(this.currentToken.refresh_token) {
            await this.repo.update({ id: 1}, { ebay_refresh_token: this.currentToken.refresh_token});
            this.token_vaild = Date.now() + (res.expires_in  * 1000);
          }
     
        } catch (err) {
            console.log(err)
            return err;
        }
        
    }
    //get refresh access token
    async renevToken(refresh_token: string) {
        const qs = (await import('query-string')).default;
        const _body = {
            grant_type: 'refresh_token',
            refresh_token: decodeURIComponent(refresh_token)
        }
        const body = qs.stringify(_body);
            const encodedStr = base64Encode(env.ebay_app_id + ':' + env.ebay_app_secret);
            const auth = 'Basic ' + encodedStr;
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
     
            try {
               const res =  await this.request.sendRequest(env.ebay_oauth_ident, 'POST', auth, headers, body);
               this.currentToken.access_token = res.access_token;
               this.currentToken.expires_in = res.expires_in;
               this.token_vaild = Date.now() + (res.expires_in  * 1000);
            } catch (err) {
                console.log(err)
            }
            
    }
    //get url to usr consent
    async getUserConsent() {
        try {
            return { address: `${env.ebay_oauth_autorize}?client_id=${env.ebay_app_id}&redirect_uri=${env.ebay_redirect}&response_type=code&scope=${env.ebay_default_body.scope}&state=1111`};
        } catch (err) {
            console.log(err)
        }
    }

}


