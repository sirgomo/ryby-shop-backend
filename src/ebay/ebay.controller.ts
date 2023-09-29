import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
}
