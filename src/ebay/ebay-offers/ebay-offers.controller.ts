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
  @Get('fulfillment-policy/:id')
  async getfulfillmentPolicyById(@Param('id') id: string) {
    return await this.offerService.getfulfillmentPolicyById(id);
  }
  @Get('allfulfillment-policy/:marktid')
  async allgetfulfillmentPolicyById(@Param('marktid') id: string) {
    return await this.offerService.allgetfulfillmentPolicyById(id);
  }
  @Get('payment-policies/:marktid')
  async getPaymentPolicies(@Param('marktid') id: string) {
    return await this.offerService.getPaymentPolicies(id);
  }
  @Get('return-policies/:marktid')
  async getReturnPolicies(@Param('marktid') id: string) {
    return await this.offerService.getReturnPolicies(id);
  }
}
