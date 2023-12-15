import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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
  async createRefund(
    @Body() item: { refundDto: EbayRefundDto; refundOnEbay: any },
  ): Promise<EbayRefund[]> {
    return await this.service.createRefund(item.refundDto, item.refundOnEbay);
  }

  @Get(':id')
  async getRefundById(@Param('id') id: string): Promise<EbayRefund[]> {
    return await this.service.getRefundById(id);
  }

  @Get(':ser/:page/:prosite')
  async getAllRefunds(
    @Param('ser') ser: string,
    @Param('page') page: number,
    @Param('prosite') prosite: number,
  ): Promise<[EbayRefund[], number]> {
    return await this.service.getAllRefunds(ser, page, prosite);
  }

  @Delete(':id')
  async deleteRefund(@Param('id') id: number): Promise<DeleteResult> {
    return await this.service.deleteRefund(id);
  }
}
