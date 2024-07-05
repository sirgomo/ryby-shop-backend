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
    @Get('ebay-month/:year/:month/:pagenr/:sitecount')
    async getMonthDetailEbay(@Param('year') year: number,
     @Param('month') month: number, 
     @Param('pagenr') pagenr: number,
     @Param('sitecount') sitecount: number
     ) {
        return await this.service.detailMonthAndYearEbay(month, year, pagenr, sitecount);
    }
    @Get('shop-month/:year/:month/:pagenr/:sitecount')
    async getMonthDetailShop(@Param('year') year: number, 
    @Param('month') month: number, 
    @Param('pagenr') pagenr: number,
    @Param('sitecount') sitecount: number ) {
        return await this.service.detailMonthAndYearShop(month, year, pagenr, sitecount);
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
