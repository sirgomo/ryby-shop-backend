import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kunde } from 'src/entity/kundeEntity';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Kunde, AdresseKunde, Lieferadresse])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
