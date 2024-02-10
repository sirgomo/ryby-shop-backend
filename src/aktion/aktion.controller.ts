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
@UseGuards(JwtAuthGuard)
export class AktionController {
  constructor(private readonly service: AktionService) {}
  @Post()
  async create(@Body() aktionData: Partial<AktionDto>) {
    return await this.service.createAktion(aktionData);
  }

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.service.findOneById(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() aktionData: AktionDto) {
    return await this.service.updateAktion(id, aktionData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.service.deleteAktion(id);
  }
}
