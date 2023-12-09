import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { Product_RuckgabeDto } from 'src/dto/product_ruckgabe.dto';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { DeleteResult } from 'typeorm';
import { ShopRefundService } from './shop-refund.service';

@Controller('shop-refund')
@UseGuards(JwtAuthGuard)
export class ShopRefundController {
  constructor(private readonly refundService: ShopRefundService) {}

  @Post()
  async createRefund(
    @Body() refundDto: Product_RuckgabeDto,
  ): Promise<ProduktRueckgabe> {
    return await this.refundService.createRefund(refundDto);
  }

  @Get(':id')
  async getRefundById(@Param('id') id: number): Promise<ProduktRueckgabe> {
    return await this.refundService.getRefundById(id);
  }

  @Put(':id')
  async updateRefund(
    @Param('id') id: number,
    @Body() refundDto: Product_RuckgabeDto,
  ): Promise<ProduktRueckgabe> {
    return await this.refundService.updateRefund(id, refundDto);
  }

  @Delete(':id')
  async deleteRefund(@Param('id') id: number): Promise<DeleteResult> {
    return await this.refundService.deleteRefund(id);
  }
}
