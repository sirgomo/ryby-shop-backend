import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { LogsEntity } from 'src/entity/logsEntity';
import { DeleteResult } from 'typeorm';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get(':class/:site/:take')
  async getAllLogs(
    @Param('class') er_class: string,
    @Param('site') site: number,
    @Param('take') take: number,
  ): Promise<[LogsEntity[], number]> {
    try {
      return await this.logsService.getAllLog(er_class, site, take);
    } catch (error) {
      throw new HttpException(
        'Failed to get logs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/class/:logsClass')
  async getLogsByClass(
    @Param('logsClass') logsClass: string,
  ): Promise<LogsEntity[]> {
    try {
      return await this.logsService.getLogsByClass(logsClass as any);
    } catch (error) {
      throw new HttpException(
        'Failed to get logs by class',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:id')
  async getLogById(@Param('id') id: string): Promise<LogsEntity> {
    try {
      const log = await this.logsService.getLogById(Number(id));
      if (!log) {
        throw new HttpException('Log not found', HttpStatus.NOT_FOUND);
      }
      return log;
    } catch (error) {
      throw new HttpException(
        'Failed to get log by ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/:id')
  async deleteLogById(@Param('id') id: string): Promise<DeleteResult> {
    try {
      const result = await this.logsService.deleteLogById(Number(id));
      if (result.affected === 0) {
        throw new HttpException('Log not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      throw new HttpException(
        'Failed to delete log',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
