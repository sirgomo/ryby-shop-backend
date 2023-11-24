import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EbayRefundDto } from 'src/dto/ebay/transactionAndRefunds/ebayRefundDto';
import { EbayRequest } from 'src/ebay/ebay.request';
import { EbayService } from 'src/ebay/ebay.service';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { env } from 'src/env/env';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class RefundService {
    request = new EbayRequest();
    constructor(@InjectRepository(EbayRefund) private repo: Repository<EbayRefund>, private readonly ebayService: EbayService) {}
    async createRefund(refundDto: EbayRefundDto, refundOnEbay: any): Promise<EbayRefund> {
        try {
          const refund = this.repo.create(refundDto);
          const saved = await this.repo.save(refund);
          //wait for occassion to test it
      /*   if(saved) {
            await this.ebayService.checkAccessToken();
            
              const  headers = {
                'Accept': 'application/json',
                'Accept-Language': 'de-DE',
            }
             let res: { 
             "refundId" : "string",
             "refundStatus" : "RefundStatusEnum : [FAILED,PENDING,REFUNDED]" };
             res = await this.request.sendRequest(env.ebay_api+`sell/fulfillment/v1/order/${refundDto.orderId}/issue_refund`, 'POST', this.ebayService.currentToken.access_token, headers,refundOnEbay) as any;
            console.log(res);
            }*/
          return saved;
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
    
      async getRefundById(id: number): Promise<EbayRefund> {
        try {
        const item = await this.repo.findOne({where: {id: id}, relations: 
            {refund_items: true}
        });

        if(!item) {
            return {id: -1} as EbayRefund;
        }
        return item;
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
    
      async getAllRefunds(): Promise<EbayRefund[]> {
        try {
          return await this.repo.find({relations: {refund_items: true}});
        } catch (error) {
          throw new Error(error.message);
        }
      }
    
      async updateRefund(id: number, refundDto: EbayRefundDto): Promise<EbayRefund> {
        try {
            throw new HttpException('Refund kann nicht gelöscht werden!', HttpStatus.BAD_REQUEST);
          const refund = await this.getRefundById(id);
          await this.repo.merge(refund, refundDto);
          return await this.repo.save(refund);
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
    
      async deleteRefund(id: number): Promise<DeleteResult> {
        try {
            throw new HttpException('Refund kann nicht gelöscht werden!', HttpStatus.BAD_REQUEST);
        //  return await this.repo.delete(id);
        } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
      }
}
