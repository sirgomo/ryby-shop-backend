import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly service: DashboardService) {}
    @Get('eals/:year')
    async getEbayShopData(@Param('year') year: string) {
        return await this.service.getEbayTRansactionsData(year);
    }
    @Get('ebay-netto/:year') 
    async getEbayNetto(@Param('year') year: string) {
        return await this.service.getEbayNettoData(year);
    }
    @Get('shop-netto/:year') 
    async getShopNetto(@Param('year') year: string) {
        return await this.service.getShopNettoData(year);
    }
    @Get('months/:year') 
    async getMonths(@Param('year') year: string) {
        return await this.service.getMonths(year);
    }
    @Get('years')
    async getYears() {
        return await this.service.getYears();
    }
    
}
