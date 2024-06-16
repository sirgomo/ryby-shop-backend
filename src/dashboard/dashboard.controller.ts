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
}
