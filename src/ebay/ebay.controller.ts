import { Body, Controller, Get, Header, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { env } from 'src/env/env';

@Controller('ebay')
export class EbayController {
    constructor(private readonly service: EbayService) {}
    @Get()
    @UseGuards(JwtAuthGuard)
    async getEbaySoldOrders() {
        return await this.service.getEbaySoldOrders();
    }
    @Get('consent')
    @UseGuards(JwtAuthGuard)
    async getUserConsent() {
        return await this.service.getUserConsent();
    }
    @Post()
    @UseGuards(JwtAuthGuard)
    async getUserAccesToken(@Body() code : { code: string }) {
        return await this.service.getAccessToken(code.code);
    }
    @Get('redirect/consent')
    async userEbayAcceptConsent(
        @Query('state') state: number,
        @Query('code') code: string,
        @Query('expires_in') expires_in: number
         ) {
            await this.service.getAccessToken(code);
         }
    @Get('deletion')
    //@Header('Content-type', 'application/json')
    async getDeletionEbayResponse(@Query('challenge_code') challenge: string, @Res() res: Response) {
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
    @Post('notifi')
    async postNotificationFromEbay(@Req() req: Request, @Res() res: Response) {
        console.log(req.body)

        return res.status(200).send();
    }
}
