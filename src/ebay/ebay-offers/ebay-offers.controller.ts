import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EbayOffersService } from './ebay-offers.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('ebay-offers')
@UseGuards(JwtAuthGuard)
export class EbayOffersController {
    constructor(private readonly offerService: EbayOffersService) {}
    @Get(':sku')
    async getOffers(@Param('sku') sku: string) {
        return await this.offerService.getOfferBySku(sku);
    }

}
