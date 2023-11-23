import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayTranscationsDto } from 'src/dto/ebay/transactionAndRefunds/ebayTransactionDto';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { DeleteResult } from 'typeorm';
import { EbaySoldService } from './ebay-sold.service';

@Controller('ebay-sold')
@UseGuards(JwtAuthGuard)
export class EbaySoldController {
    constructor(private readonly ebaySoldService: EbaySoldService) {}

    @Get()
    getAllTransactions(): Promise<EbayTransactions[]> {
        return this.ebaySoldService.getAllTransactions();
    }

    @Get(':id')
    getTransactionById(@Param('id') id: string): Promise<EbayTransactions> {
        return this.ebaySoldService.getTransactionById(id);
    }

    @Post()
    createTransaction(@Body() transaction: EbayTranscationsDto): Promise<EbayTransactions> {
        return this.ebaySoldService.createTransaction(transaction);
    }

    @Put(':id')
    updateTransaction(@Param('id') id: number, @Body() transaction: EbayTranscationsDto): Promise<EbayTransactions> {
        return this.ebaySoldService.updateTransaction(id, transaction);
    }

    @Delete(':id')
    deleteTransaction(@Param('id') id: number): Promise<DeleteResult> {
        return this.ebaySoldService.deleteTransaction(id);
    }
}
