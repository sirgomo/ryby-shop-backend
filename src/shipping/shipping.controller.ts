import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingCostDto } from 'src/dto/shippingCost.dto';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createShippingDto: ShippingCostDto) {
    try {
      return await this.shippingService.createShipping(createShippingDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.shippingService.getAllShipping();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      return await this.shippingService.getShippingById(id);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateShippingDto: ShippingCostDto,
  ) {
    try {
      return await this.shippingService.updateShipping(id, updateShippingDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number) {
    try {
      return await this.shippingService.deleteShipping(id);
    } catch (error) {
      throw error;
    }
  }
}
