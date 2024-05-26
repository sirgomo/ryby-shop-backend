import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcctionLogsDto } from 'src/dto/acction_logs.dto';
import { LOGS_CLASS, LogsEntity } from 'src/entity/logsEntity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogsEntity) private readonly repo: Repository<LogsEntity>,
  ) {}
  async getAllLog(
    log_class: string,
    site: number,
    take: number,
  ): Promise<[LogsEntity[], number]> {
    try {

      const skip = site * take - take;

      if (log_class === 'NULL') {
        return await this.repo.findAndCount({
          select: {
            id: true,
            error_class: true,
            user_email: true,
            created_at: true,
            paypal_transaction_id: true,
            ebay_transaction_id: true,
          },
          take: take,
          skip: skip,
        });
      } else {
        return await this.repo.findAndCount({
          where: {
            error_class: log_class,
          },
          select: {
            id: true,
            error_class: true,
            user_email: true,
            created_at: true,
            paypal_transaction_id: true,
            ebay_transaction_id: true,
          },
          take: take,
          skip: skip,
        });
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async saveLog(log: AcctionLogsDto): Promise<void> {
    try {
      const newlog = await this.repo.create(log);
      await this.repo.save(newlog);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async getLogsByClass(logs_class: LOGS_CLASS): Promise<LogsEntity[]> {
    try {
      return await this.repo.find({
        where: {
          error_class: logs_class,
        },
        select: {
          id: true,
          error_class: true,
          user_email: true,
          created_at: true,
        },
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async getLogById(id: number): Promise<LogsEntity> {
    try {
      return await this.repo.findOne({ where: { id: id } });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async deleteLogById(id: number): Promise<DeleteResult> {
    try {
      return await this.repo.delete({ id: id });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
