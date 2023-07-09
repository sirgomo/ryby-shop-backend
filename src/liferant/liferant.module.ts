import { Module } from '@nestjs/common';
import { LiferantController } from './liferant.controller';
import { LiferantService } from './liferant.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lieferant } from 'src/entity/lifernatEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lieferant]), AuthModule],
  controllers: [LiferantController],
  providers: [LiferantService]
})
export class LiferantModule {}
