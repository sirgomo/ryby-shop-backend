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
import { EbayTranscationsDto } from 'src/dto/ebay/transactionAndRefunds/ebayTransactionDto';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { DeleteResult } from 'typeorm';
import { EbaySoldService } from './ebay-sold.service';
import { GetOrderSettingsDto } from 'src/dto/getOrderSettings.dto';

@Controller('ebay-sold')
@UseGuards(JwtAuthGuard)
export class EbaySoldController {
  constructor(private readonly ebaySoldService: EbaySoldService) {}

  @Get()
  async getAllTransactions(): Promise<EbayTransactions[]> {
    return await this.ebaySoldService.getAllTransactions();
  }
  @Get('orders/nr')
  async getEbayOrdersForBestellung(@Body() settings: GetOrderSettingsDto,@Param('nr') nr: number): Promise<[EbayTransactions[], number]> {
    return await this.ebaySoldService.getEbayOrders(settings, nr);
  }

  @Get(':id')
  async getTransactionById(@Param('id') id: string): Promise<EbayTransactions> {
    return await this.ebaySoldService.getTransactionById(id);
  }

  @Post()
  async createTransaction(
    @Body() transaction: EbayTranscationsDto,
  ): Promise<EbayTransactions> {
    return await this.ebaySoldService.createTransaction(transaction);
  }

  @Put(':id')
  async updateTransaction(
    @Param('id') id: number,
    @Body() transaction: EbayTranscationsDto,
  ): Promise<EbayTransactions> {
    return await this.ebaySoldService.updateTransaction(id, transaction);
  }

  @Delete(':id')
  async deleteTransaction(@Param('id') id: number): Promise<DeleteResult> {
    return await this.ebaySoldService.deleteTransaction(id);
  }
}
