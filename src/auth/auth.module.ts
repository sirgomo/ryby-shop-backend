import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kunde } from 'src/entity/kundeEntity';
import { UsersService } from 'src/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/env/env';
import { JwtStrategy } from './auth.JwtStrategy.strategy';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kunde, AdresseKunde, Lieferadresse]),
    PassportModule,
    JwtModule.register({
      secret: env.jwt_const,
      signOptions: {
        expiresIn: '60m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
