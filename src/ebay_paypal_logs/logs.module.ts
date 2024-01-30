import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsEntity } from 'src/entity/logsEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([LogsEntity]), AuthModule],
  providers: [LogsService],
  controllers: [LogsController],
})
export class LogsModule {}
