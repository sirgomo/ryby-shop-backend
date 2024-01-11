import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayService } from './ebay.service';
import { EbaySubscriptionsPayloadDto } from 'src/dto/ebay/ebaySubscriptionsPayload.dto';
import { EbayRequest } from './ebay.request';
import { EbayTopicsPayloadDto } from 'src/dto/ebay/ebayTopicsPayload.dto';
import { env } from 'src/env/env';

@Controller('subs')
export class SubsController {
  request = new EbayRequest();
  constructor(private readonly ebayServ: EbayService) {}
  //get all ebay subscriptions
  @Get('subscriptions/:limit/:token')
  @UseGuards(JwtAuthGuard)
  async getAllEbaySubscriptions(
    @Param('limit') limit: number,
    @Param('token') token: string,
  ) {
    try {
      await this.ebayServ.checkAccessToken();

      const subscriptions: EbaySubscriptionsPayloadDto =
        token !== 'null'
          ? await this.request.getRequest(
              `${env.ebay_api}/commerce/notification/v1/subscription?
        limit=${limit}&
        continuation_token=${token}`,
              this.ebayServ.currentToken.access_token,
            )
          : await this.request.getRequest(
              `${env.ebay_api}/commerce/notification/v1/subscription?
        limit=${limit}`,
              this.ebayServ.currentToken.access_token,
            );
      return subscriptions;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  @Get('topics/:limit/:token')
  @UseGuards(JwtAuthGuard)
  async getEbayTopics(
    @Param('limit') limit: number,
    @Param('token') token: string,
  ) {
    try {
      await this.ebayServ.checkAccessToken();

      const topics: EbayTopicsPayloadDto =
        token !== 'null'
          ? await this.request.getRequest(
              `${env.ebay_api}/commerce/notification/v1/topic?limit=${limit}&continuation_token=${token}`,
              this.ebayServ.currentToken.access_token,
            )
          : await this.request.getRequest(
              `${env.ebay_api}/commerce/notification/v1/topic?limit=${limit}`,
              this.ebayServ.currentToken.access_token,
            );

      return topics;
    } catch (err) {
      return err;
    }
  }
  @Get('topic/:id')
  @UseGuards(JwtAuthGuard)
  async getEbayTopic(@Param('id') id: string) {
    try {
      await this.ebayServ.checkAccessToken();
      return await this.request.getRequest(
        `${env.ebay_api}/commerce/notification/v1/topic/${id}`,
        this.ebayServ.currentToken.access_token,
      );
    } catch (err) {
      return err;
    }
  }
}
