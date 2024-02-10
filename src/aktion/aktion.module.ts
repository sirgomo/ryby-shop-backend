import { Module } from '@nestjs/common';
import { AktionController } from './aktion.controller';
import { AktionService } from './aktion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aktion } from 'src/entity/aktionEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Aktion]), AuthModule],
  controllers: [AktionController],
  providers: [AktionService],
})
export class AktionModule {}
