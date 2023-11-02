import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LagerDto } from 'src/database/lager.dto';
import { Lager } from 'src/entity/lagerEntity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class LagerService {
    constructor(
        @InjectRepository(Lager)
        private lagerRepository: Repository<Lager>,
      ) {}
    async getAllWarehouses() {
        try {
            return await this.lagerRepository.find()
        } catch (err) {
            return err;
        }
    }
     async createWarehouse(newlager: LagerDto): Promise<Lager> {
        try {
          const lager = await this.lagerRepository.create(newlager);
          return await this.lagerRepository.save(lager);
        } catch (error) {
          throw error;
        }
      }
    
      async getWarehouseById(id: number): Promise<Lager> {
        try {
          return await this.lagerRepository.findOne({where : { id: id }, relations: {
            lagerorte: true,
          }});
        } catch (error) {
          throw error;
        }
      }
    
      async updateWarehouse(edLager: LagerDto): Promise<Lager> {
        try {
            const up = await this.lagerRepository.create(edLager);
          const lager = await this.getWarehouseById(edLager.id);
            const merged = await this.lagerRepository.merge(up, lager)
          return await this.lagerRepository.save(merged);
        } catch (error) {
          throw error;
        }
      }
    
      async deleteWarehouse(id: number): Promise<DeleteResult> {
        try {
          return await this.lagerRepository.delete(id);
        } catch (error) {
          throw error;
        }
      }
}
