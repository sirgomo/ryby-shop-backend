import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EbayService } from './ebay.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { Request, Response } from 'express';
import { env } from 'src/env/env';
import { ebayProccess } from './notifications/ebay.process.notification';
import { verifyChalange } from './notifications/ebay.notValidator';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Controller('ebay')
export class EbayController {
  constructor(
    private readonly service: EbayService,
    private readonly logsService: LogsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getEbaySoldOrders() {
    return await this.service.getEbaySoldOrders();
  }

  //get url for user consent
  @Get('consent')
  @UseGuards(JwtAuthGuard)
  async getUserConsent() {
    return await this.service.getUserConsent();
  }

  //get automatic access token and refreshtoken after user has consent
  @Get('redirect/consent')
  async userEbayAcceptConsent(
    @Query('state') state: number,
    @Query('code') code: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('expires_in') expires_in: number,
  ) {
    await this.service.getAccessToken(code);
  }

  @Get('deletion')
  getDeletionEbayResponse(
    @Query('challenge_code') challenge: string,
    @Res() res: Response,
  ) {
    res.set('Content-type', 'application/json').json({
      challengeResponse: verifyChalange(
        challenge,
        env.ebay_deletion_Link,
        env.ebay_deletion_VerificationToken,
      ),
    });
    return res;
  }
  @Post('deletion')
  async postDeletionEbay(@Req() req: Request, @Res() res: Response) {
    const proc = await ebayProccess(
      req.body,
      req.headers['x-ebay-signature'],
      this.service,
      this.logsService,
    );
    return res.status(proc).send();
  }
  @Post('notifi')
  async postNotificationFromEbay(@Req() req: Request, @Res() res: Response) {
    const proc = await ebayProccess(
      req.body,
      req.headers['x-ebay-signature'],
      this.service,
      this.logsService,
    );
    return res.status(proc).send();
  }
  @Get('notifi')
  async getNotificationFromEbay(
    @Query('challenge_code') challenge: string,
    @Res() res: Response,
  ) {
    //const respo = res;
    res.set('Content-type', 'application/json').json({
      challengeResponse: verifyChalange(
        challenge,
        env.ebay_notifi_Link,
        env.ebay_notifi_VerificationToken,
      ),
    });
    return res;
  }
}
