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
import { AktionService } from './aktion.service';
import { AktionDto } from 'src/dto/aktion.dto';

@Controller('aktion')
export class AktionController {
  constructor(private readonly service: AktionService) {}

  @Get('promo/:code')
  async getCode(@Param('code') code: string) {
    return await this.service.getPromo(code);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() aktionData: Partial<AktionDto>) {
    return await this.service.createAktion(aktionData);
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return await this.service.findOneById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: number, @Body() aktionData: AktionDto) {
    return await this.service.updateAktion(id, aktionData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number) {
    return await this.service.deleteAktion(id);
  }
}
