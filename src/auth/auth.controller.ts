import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/dto/register.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post()
  login(@Body() user: { email: string; password: string }) {
    return this.authService.login(user);
  }
  @Post('/reg')
  registerNewUser(@Body() user: RegisterUserDto) {
    return this.userService.createUser(user);
  }
}
