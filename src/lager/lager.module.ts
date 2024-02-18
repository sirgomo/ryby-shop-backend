import { Module } from '@nestjs/common';
import { LagerService } from './lager.service';
import { LagerController } from './lager.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lager } from 'src/entity/lagerEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lager]), AuthModule],
  providers: [LagerService],
  controllers: [LagerController],
})
export class LagerModule {}
