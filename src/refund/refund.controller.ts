import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { RefundService } from './refund.service';
import { EbayRefundDto } from 'src/dto/ebay/transactionAndRefunds/ebayRefundDto';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { DeleteResult } from 'typeorm';

@Controller('refund')
@UseGuards(JwtAuthGuard)
export class RefundController {
    constructor(private service: RefundService) {}
    @Post()
  async createRefund(@Body() refundDto: EbayRefundDto, @Body('refundOnEbay') refundOnEbay: any): Promise<EbayRefund> {
    return await this.service.createRefund(refundDto, refundOnEbay);
  }

  @Get(':id')
  async getRefundById(@Param('id') id: number): Promise<EbayRefund> {
    return await this.service.getRefundById(id);
  }

  @Get()
  async getAllRefunds(): Promise<EbayRefund[]> {
    return await this.service.getAllRefunds();
  }

  @Put(':id')
  async updateRefund(@Param('id') id: number, @Body() refundDto: EbayRefundDto): Promise<EbayRefund> {
    return await this.service.updateRefund(id, refundDto);
  }

  @Delete(':id')
  async deleteRefund(@Param('id') id: number): Promise<DeleteResult> {
    return await this.service.deleteRefund(id);
  }
}
