import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(useremail: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(useremail);
    if (user === null) return null;

    const passwordMatch = await bcrypt.compare(pass, user.password);
    if (passwordMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async login(user: any) {
    const vuser = await this.validateUser(user.email, user.password);
    if (vuser === null) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: vuser.email, sub: vuser.id, role: vuser.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
