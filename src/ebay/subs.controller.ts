import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayService } from './ebay.service';
import { env } from 'process';
import { EbaySubscriptionsPayloadDto } from 'src/dto/ebay/ebaySubscriptionsPayload.dto';
import { EbayRequest } from './ebay.request';

@Controller('subs')
export class SubsController {
    request = new EbayRequest();
    constructor (private readonly ebayServ: EbayService) {}
       //get all ebay subscriptions
   @Get('subscriptions/:limit/:token')
   @UseGuards(JwtAuthGuard)
   async getAllEbaySubscriptions(@Param('limit') limit: number, @Param('token') token: string) {
    try {
        await this.ebayServ.checkAccessToken();


        const Subscriptions: EbaySubscriptionsPayloadDto = token !== 'null' ? await this.request.getRequest(`${env.ebay_api}/commerce/notification/v1/subscription?
        limit=${limit}&
        continuation_token=${token}`, this.ebayServ.currentToken.access_token) : await this.request.getRequest(`${env.ebay_api}/commerce/notification/v1/subscription?
        limit=${limit}`, this.ebayServ.currentToken.access_token) ;
        return Subscriptions;
      } catch (err) {
        console.log(err);
        return err;
      }
   }
}
