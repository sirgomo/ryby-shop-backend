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
import { LieferantDto } from 'src/dto/liferant.dto';
import { Lieferant } from 'src/entity/lifernatEntity';
import { LiferantService } from './liferant.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('liferant')
@UseGuards(JwtAuthGuard)
export class LiferantController {
  constructor(private readonly lieferantService: LiferantService) {}

  @Get()
  async findAll(): Promise<Lieferant[]> {
    return await this.lieferantService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: number): Promise<Lieferant> {
    return await this.lieferantService.findById(id);
  }

  @Post()
  async create(@Body() lieferant: LieferantDto): Promise<Lieferant> {
    return await this.lieferantService.create(lieferant);
  }

  @Put()
  async update(@Body() lieferant: LieferantDto): Promise<Lieferant> {
    return await this.lieferantService.update(lieferant);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<number> {
    return await this.lieferantService.delete(id);
  }
}
