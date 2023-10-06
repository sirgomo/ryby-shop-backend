import { Body, Controller, Get, Header, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { env } from 'src/env/env';
import { ebayProccess } from './notifications/ebay.process.notification';

@Controller('ebay')
export class EbayController {
    constructor(private readonly service: EbayService) {}

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
        @Query('expires_in') expires_in: number
         ) {
            await this.service.getAccessToken(code);
         }

    @Get('deletion')
    getDeletionEbayResponse(@Query('challenge_code') challenge: string, @Res() res: Response) {
        const respo = res;
        const hash = createHash('sha256');
        hash.update(challenge);
        hash.update(env.ebay_deletion_VerificationToken);
        hash.update(env.ebay_deletion_Link);
        const resHash = hash.digest('hex');
        console.log({"challengeResponse": resHash.toString()});
       
        res.set('Content-type', 'application/json').json({ challengeResponse: resHash.toString()});
      return res;
       
    }
    @Post('deletion')
    async postDeletionEbay(@Req() req: Request, @Res() res: Response) {
      const proc = await  ebayProccess(req.body, req.headers['x-ebay-signature'], this.service);
      return res.status(proc).send();
    }
    @Post('notifi')
    async postNotificationFromEbay(@Req() req: Request, @Res() res: Response) {
        const proc = await ebayProccess(req.body, req.headers['x-ebay-signature'], this.service);
        return res.status(proc).send();
    }
}
