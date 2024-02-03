import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { EbayTranscationsDto } from 'src/dto/ebay/transactionAndRefunds/ebayTransactionDto';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { LOGS_CLASS } from 'src/entity/logsEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class EbaySoldService {
  constructor(
    @InjectRepository(EbayTransactions)
    private readonly repo: Repository<EbayTransactions>,
    private readonly logsService: LogsService,
  ) {}

  async getAllTransactions(): Promise<EbayTransactions[]> {
    try {
      return await this.repo.find();
    } catch (error) {
      throw error;
    }
  }

  async getTransactionById(id: string): Promise<EbayTransactions> {
    try {
      const item = await this.repo.findOne({
        where: { orderId: id },
        relations: {
          items: true,
          refunds: true,
        },
      });

      if (!item) return { id: -1 } as EbayTransactions;

      return item;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to get transaction',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createTransaction(
    transaction: EbayTranscationsDto,
  ): Promise<EbayTransactions> {
    try {
      const itemC = await this.repo.create(transaction);
      itemC.creationDate = new Date(Date.now());
      if (itemC.payment_status !== 'PAID') {
        throw new HttpException(
          'Transaction not paid !',
          HttpStatus.BAD_REQUEST,
        );
      }
      let savedTransaction = null;
      await this.repo.manager.transaction(async (manager) => {
        const items: ProduktVariations[] = [];

        for (let i = 0; i < transaction.items.length; i++) {
          const item = await manager.findOne(ProduktVariations, {
            where: { sku: transaction.items[i].sku },
          });
          if (!item) {
            throw new HttpException(
              'Item not found in database !' + transaction.items[i].sku,
              HttpStatus.NOT_FOUND,
            );
          }
          if (
            transaction.items[i].quanity <= item.quanity &&
            item.quanity > 0
          ) {
            item.quanity -=
              transaction.items[i].quanity * item.quanity_sold_at_once;
            if (item.quanity_sold == null) item.quanity_sold = 0;

            item.quanity_sold +=
              transaction.items[i].quanity * item.quanity_sold_at_once;
          } else {
            throw new HttpException(
              'Not enough items in stock ! ' + transaction.items[i].sku,
              HttpStatus.NOT_ACCEPTABLE,
            );
          }

          items.push(item);
        }
        await manager.save(items);
        savedTransaction = await manager.save(itemC);
      });
      const transLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.SUCCESS_LOG,
        error_message: JSON.stringify(savedTransaction),
        ebay_transaction_id: savedTransaction.orderId,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(transLog);

      return savedTransaction;
    } catch (error) {
      const transLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.EBAY_ERROR,
        error_message: JSON.stringify(transaction),
        ebay_transaction_id: transaction.orderId,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(transLog);
      throw error;
    }
  }

  async updateTransaction(
    id: number,
    transaction: EbayTranscationsDto,
  ): Promise<EbayTransactions> {
    try {
      const existingTransaction = await this.repo.findOne({
        where: { id: id },
      });
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }
      const updatedTransaction = await this.repo.merge(
        existingTransaction,
        transaction,
      );
      const transLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.SERVER_LOG,
        error_message: JSON.stringify(updatedTransaction),
        ebay_transaction_id: transaction.orderId,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(transLog);
      return await this.repo.save(updatedTransaction);
    } catch (error) {
      const transLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.EBAY_ERROR,
        error_message: JSON.stringify(transaction),
        ebay_transaction_id: transaction.orderId,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(transLog);
      throw new Error('Failed to update transaction');
    }
  }

  async deleteTransaction(id: number): Promise<DeleteResult> {
    try {
      const existingTransaction = await this.repo.findOne({
        where: { id: id },
      });
      if (!existingTransaction) {
        throw new Error('Transaction not found');
      }
      const transLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.DELETE,
        error_message: JSON.stringify(existingTransaction),
        ebay_transaction_id: existingTransaction.orderId,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(transLog);
      return await this.repo.delete(existingTransaction);
    } catch (error) {
      const transLog: AcctionLogsDto = {
        error_class: LOGS_CLASS.DELETE,
        error_message: 'Delete id ' + id,
        created_at: new Date(Date.now()),
      };
      await this.logsService.saveLog(transLog);
      throw new Error('Failed to delete transaction');
    }
  }
}
