import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { env } from 'src/env/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwt_const,
    });
  }

  async validate(payload: any): Promise<any> {
    return {
      userid: payload.sub,
      useremail: payload.email,
      role: payload.role,
    };
  }
}
