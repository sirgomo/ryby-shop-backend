import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WarenEingangDto } from 'src/dto/warenEingang.dto';
import { WarenEingangProductDto } from 'src/dto/warenEingangProduct.dto';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { WareneingangProduct } from 'src/entity/warenEingangProductEntity';
import { WarenEingangBuchenService } from './waren-eingang-buchen.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('waren-eingang-buchen')
@UseGuards(JwtAuthGuard)
export class WarenEingangBuchenController {
  constructor(
    private readonly warenEingangBuchenService: WarenEingangBuchenService,
  ) {}
  @Get()
  async getAll(): Promise<Wareneingang[]> {
    return await this.warenEingangBuchenService.getAll();
  }

  @Get(':id')
  async getWareneingang(@Param('id') id: number): Promise<Wareneingang> {
    return await this.warenEingangBuchenService.findById(id);
  }

  @Post()
  async createWareneingang(
    @Body() wareneingangDto: WarenEingangDto,
  ): Promise<Wareneingang> {
    return await this.warenEingangBuchenService.create(wareneingangDto);
  }

  @Put()
  async updateWareneingang(
    @Body() wareneingangDto: WarenEingangDto,
  ): Promise<Wareneingang> {
    return await this.warenEingangBuchenService.update(wareneingangDto);
  }

  @Delete(':id')
  async deleteWareneingang(@Param('id') id: number): Promise<any> {
    return await this.warenEingangBuchenService.delete(id);
  }

  @Post(':wareneingangId/products')
  async addProduct(
    @Param('wareneingangId') wareneingangId: number,
    @Body() productDto: WarenEingangProductDto,
  ): Promise<WareneingangProduct> {
    return await this.warenEingangBuchenService.addProduct(
      wareneingangId,
      productDto,
    );
  }

  @Patch(':wareneingangId/products/:productId')
  async updateProduct(
    @Param('wareneingangId') wareneingangId: number,
    @Param('productId') productId: number,
    @Body() productDto: WarenEingangProductDto,
  ): Promise<WareneingangProduct> {
    return await this.warenEingangBuchenService.updateProduct(
      wareneingangId,
      productId,
      productDto,
    );
  }

  @Delete(':wareneingangId/products/:productId')
  async deleteProduct(
    @Param('wareneingangId') wareneingangId: number,
    @Param('productId') productId: number,
  ): Promise<any> {
    return await this.warenEingangBuchenService.deleteProduct(
      wareneingangId,
      productId,
    );
  }
}
