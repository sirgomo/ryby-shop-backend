import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kunde } from 'src/entity/kundeEntity';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kunde, AdresseKunde, Lieferadresse]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
