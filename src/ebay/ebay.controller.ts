import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EbayService } from './ebay.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('ebay')
@UseGuards(JwtAuthGuard)
export class EbayController {
    constructor(private readonly service: EbayService) {}
    @Get()
    async getEbaySoldOrders() {
        return await this.service.getEbaySoldOrders();
    }
    @Get('consent')
    async getUserConsent() {
        return await this.service.getUserConsent();
    }
    @Post()
    async getUserAccesToken(@Body() code : { code: string }) {
        return await this.service.getAccessToken(code.code);
    }
    @Get('redirect/consent?')
    async userEbayAcceptConsent(
        @Query('state') state: number,
        @Query('code') code: string,
        @Query('expires_in') expires_in: number
         ) {
            await this.service.getAccessToken(code);
         }
}
