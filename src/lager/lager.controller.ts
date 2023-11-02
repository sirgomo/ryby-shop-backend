import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { LagerDto } from 'src/database/lager.dto';
import { Lager } from 'src/entity/lagerEntity';
import { LagerService } from './lager.service';
import { DeleteResult } from 'typeorm';

@Controller('lager')
@UseGuards(JwtAuthGuard)
export class LagerController {
    constructor(private warehaouseService: LagerService) {}
    @Get()
    async getAllWarehouses() :Promise<Lager[]> {
        return await this.warehaouseService.getAllWarehouses();
    }

    @Post()
    async createLager(@Body() newLager: LagerDto): Promise<Lager> {
      return await this.warehaouseService.createWarehouse(newLager);
    }
  
    @Get(':id')
    async getLagerById(@Param('id') id: number): Promise<Lager> {
      return await this.warehaouseService.getWarehouseById(id);
    }
  
    @Put()
    async updateLager(@Body() updatedLager: LagerDto): Promise<Lager> {
      return await this.warehaouseService.updateWarehouse(updatedLager);
    }
  
    @Delete(':id')
    async deleteLager(@Param('id') id: number): Promise<DeleteResult> {
        return await this.warehaouseService.deleteWarehouse(id);
    }
}
