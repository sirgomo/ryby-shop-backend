import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayService } from './ebay.service';
import { EbaySubscriptionsPayloadDto } from 'src/dto/ebay/ebaySubscriptionsPayload.dto';
import { EbayRequest } from './ebay.request';
import { EbayTopicsPayloadDto } from 'src/dto/ebay/ebayTopicsPayload.dto';
import { env } from 'src/env/env';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Controller('subs')
export class SubsController {
  request = new EbayRequest();
  constructor(
    private readonly ebayServ: EbayService,
    private readonly logsService: LogsService,
  ) {}
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
  @Get('itemsoldon')
  @UseGuards(JwtAuthGuard)
  async notificationItemSoldOn() {
    await this.ebayServ.checkAccessToken();
    const headers = {
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1331',
      'X-EBAY-API-CALL-NAME': 'SetNotificationPreferences',
      'X-EBAY-API-SITEID': '77',
      'Content-Type': 'text/xml',
    };
    const body = `<?xml version="1.0" encoding="utf-8"?>
    <SetNotificationPreferencesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${this.ebayServ.currentToken.access_token}</eBayAuthToken>
      </RequesterCredentials>
      <ApplicationDeliveryPreferences>
      <AlertEmail>mailto://sales@fischfang-profi.de</AlertEmail>
        <AlertEnable>Enable</AlertEnable>
        <ApplicationEnable>Enable</ApplicationEnable>
        <ApplicationURL>https://www.fischfang-profi.de/api/ebay/notifi</ApplicationURL>
        <DeviceType>Platform</DeviceType>
      </ApplicationDeliveryPreferences>
      <UserDeliveryPreferenceArray>
        <NotificationEnable>
          <EventEnable>Enable</EventEnable>
          <EventType>ItemSold</EventType>
        </NotificationEnable>
      </UserDeliveryPreferenceArray>
    </SetNotificationPreferencesRequest>`;
    const requ = await this.request.sendRequestXml(
      env.ebay_api + '/ws/api.dll',
      'POST',
      headers,
      body,
    );
    console.log(requ);
    return requ;
  }
  @Get('noti-prefer')
  @UseGuards(JwtAuthGuard)
  async getNotifikationPreferences() {
    await this.ebayServ.checkAccessToken();
    const headers = {
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1331',
      'X-EBAY-API-CALL-NAME': 'GetNotificationPreferences',
      'X-EBAY-API-SITEID': '77',
      'Content-Type': 'text/xml',
    };
    const body = `<?xml version="1.0" encoding="utf-8"?>
    <GetNotificationPreferencesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
    <RequesterCredentials>
    <eBayAuthToken>${this.ebayServ.currentToken.access_token}</eBayAuthToken>
    </RequesterCredentials>
    <PreferenceLevel>Application</PreferenceLevel>
    <EventType>ItemSold</EventType>
    </GetNotificationPreferencesRequest>`;
    const body2 = `<?xml version="1.0" encoding="utf-8"?>
    <GetNotificationPreferencesRequest xmlns="urn:ebay:apis:eBLBaseComponents">
    <RequesterCredentials>
    <eBayAuthToken>${this.ebayServ.currentToken.access_token}</eBayAuthToken>
    </RequesterCredentials>
    <PreferenceLevel>User</PreferenceLevel>
    <EventType>ItemSold</EventType>
    </GetNotificationPreferencesRequest>`;

    const requ = await this.request.sendRequestXml(
      env.ebay_api + '/ws/api.dll',
      'POST',
      headers,
      body,
    );
    const requ2 = await this.request.sendRequestXml(
      env.ebay_api + '/ws/api.dll',
      'POST',
      headers,
      body2,
    );

    return JSON.stringify([requ, requ2]);
  }
  @Get('itemsoldoff')
  @UseGuards(JwtAuthGuard)
  async notificationItemSoldOff() {
    await this.ebayServ.checkAccessToken();
    /*   const headers = {
      'X-EBAY-API-IAF-TOKEN': this.ebayServ.currentToken.access_token,
      'X-EBAY-API-COMPATIBILITY-LEVEL': '1085',
      'X-EBAY-API-CALL-NAME': 'ItemSold',
      'X-EBAY-API-SITEID': '77',
      'Content-Type': 'text/xml',
    };*/
  }
}
