import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShippingCostDto } from 'src/dto/shippingCost.dto';
import { ShippingEntity } from 'src/entity/shippingEntity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingEntity)
    private readonly shippingRepository: Repository<ShippingEntity>,
  ) {}

  async getAllShipping(): Promise<ShippingEntity[]> {
    try {
      const shipping = await this.shippingRepository.find();
      return shipping;
    } catch (error) {
      throw new Error(`Could not get shipping: ${error.message}`);
    }
  }
  async getShippingById(id: number): Promise<ShippingEntity> {
    try {
      return await this.shippingRepository.findOne({ where: { id: id } });
    } catch (error) {
      throw new Error(`Could not get shipping: ${error.message}`);
    }
  }
  async createShipping(shipping: ShippingCostDto): Promise<ShippingEntity> {
    try {
      return await this.shippingRepository.save(shipping);
    } catch (error) {
      throw new Error(`Could not create shipping: ${error.message}`);
    }
  }

  async updateShipping(
    id: number,
    shipping: ShippingCostDto,
  ): Promise<UpdateResult> {
    try {
      return await this.shippingRepository.update(id, shipping);
    } catch (error) {
      throw new Error(`Could not update shipping: ${error.message}`);
    }
  }

  async deleteShipping(id: number): Promise<DeleteResult> {
    try {
      return await this.shippingRepository.delete(id);
    } catch (error) {
      throw new Error(`Could not delete shipping: ${error.message}`);
    }
  }
}
