import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserUpdateDto } from 'src/dto/userUpdate.dto';
import { NewPassword } from 'src/dto/newPassword.dto';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get('/:id')
  async getUserDetails(@Param('id') userid: number) {
    return await this.userService.getUserDetails(userid);
  }
  @Patch()
  async updateUser(@Body() user: UserUpdateDto) {
    return await this.userService.updateUser(user);
  }
  @Patch('pass')
  async changePassword(@Body() pass: NewPassword) {
    return await this.userService.changePassword(pass);
  }
}
