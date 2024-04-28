import { Module } from '@nestjs/common';
import { DestructionProService } from './destruction_pro.service';
import { DestructionProController } from './destruction_pro.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Destruction_protocolEntity } from 'src/entity/destruction_protocolEntity';
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [TypeOrmModule.forFeature([Destruction_protocolEntity]), AuthModule],
  providers: [DestructionProService, ],
  controllers: [DestructionProController]
})
export class DestructionProModule {}
