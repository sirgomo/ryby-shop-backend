import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EbayRefundDto } from 'src/dto/ebay/transactionAndRefunds/ebayRefundDto';
import { EbayRequest } from 'src/ebay/ebay.request';
import { EbayService } from 'src/ebay/ebay.service';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { ProduktVariations } from 'src/entity/produktVariations';
import { env } from 'src/env/env';

import { DeleteResult, Like, Repository } from 'typeorm';

@Injectable()
export class RefundService {
  request = new EbayRequest();
  constructor(
    @InjectRepository(EbayRefund) private repo: Repository<EbayRefund>,
    private readonly ebayService: EbayService,
  ) {}
  async createRefund(
    refundDto: EbayRefundDto,
    refundOnEbay: any,
  ): Promise<EbayRefund[]> {
    try {
      const refund = await this.repo.create(refundDto);
      const testit = false;
      let saved = { id: -1 } as EbayRefund;
      await this.repo.manager.transaction(async (transactionManager) => {
        const refundPorducts: ProduktVariations[] = [];
        if (refund.refund_items && refund.refund_items.length > 0) {
          for (let i = 0; i < refund.refund_items.length; i++) {
            const item = await transactionManager.findOne(ProduktVariations, {
              where: {
                sku: refund.refund_items[i].sku,
              },
            });
            // ebay count it as 1 item sold
            item.quanity -=
              Number(refund.refund_items[i].item_quanity) *
              item.quanity_sold_at_once;
            item.quanity_sold +=
              Number(refund.refund_items[i].item_quanity) *
              item.quanity_sold_at_once;
            refundPorducts.push(item);
          }
        }
        await transactionManager.save(ProduktVariations, refundPorducts);
        return (saved = await transactionManager.save(refund));
      });

      //wait for occassion to test it
      if (saved && testit) {
        await this.ebayService.checkAccessToken();

        const headers = {
          Accept: 'application/json',
          'Accept-Language': 'de-DE',
        };
        const res: {
          refundId: 'string';
          refundStatus: 'RefundStatusEnum : [FAILED,PENDING,REFUNDED]';
        } = (await this.request.sendRequest(
          env.ebay_api +
            `sell/fulfillment/v1/order/${refundDto.orderId}/issue_refund`,
          'POST',
          this.ebayService.currentToken.access_token,
          headers,
          refundOnEbay,
        )) as any;
        console.log(res);
      }
      return await this.getRefundById(saved.orderId);
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getRefundById(orderId: string): Promise<EbayRefund[]> {
    try {
      const item = await this.repo.find({
        where: { orderId: orderId },
        relations: { refund_items: true },
      });

      if (item.length === 0) {
        return [{ id: -1 } as EbayRefund];
      }
      return item;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAllRefunds(
    search: string,
    pagenr: number,
    artprosite: number,
  ): Promise<[EbayRefund[], number]> {
    try {
      const skip = artprosite * pagenr - artprosite;
      if (search !== 'null') {
        return await this.repo.findAndCount({
          where: {
            orderId: Like(`%${search}%`),
          },
          relations: { refund_items: true },
          take: artprosite,
          skip: skip,
        });
      }

      return await this.repo.findAndCount({
        relations: { refund_items: true },
        take: artprosite,
        skip: skip,
      });
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  async deleteRefund(id: number): Promise<DeleteResult> {
    try {
      return await this.repo.manager.transaction(async (transactionManager) => {
        const refund = await transactionManager.findOne(EbayRefund, {
          where: {
            id: id,
          },
          relations: {
            refund_items: true,
          },
        });
        const refundPorducts: ProduktVariations[] = [];
        if (refund.refund_items && refund.refund_items.length > 0) {
          for (let i = 0; i < refund.refund_items.length; i++) {
            const item = await transactionManager.findOne(ProduktVariations, {
              where: {
                sku: refund.refund_items[i].sku,
              },
            });
            // ebay count it as 1 item sold
            item.quanity -=
              Number(refund.refund_items[i].item_quanity) *
              item.quanity_sold_at_once;
            item.quanity_sold +=
              Number(refund.refund_items[i].item_quanity) *
              item.quanity_sold_at_once;
            refundPorducts.push(item);
          }
        }
        await transactionManager.save(ProduktVariations, refundPorducts);
        return await transactionManager.delete(EbayRefund, { id: id });
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
