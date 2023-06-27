import { IsNotEmpty, IsNumber } from 'class-validator';

export class NewPassword {
  @IsNotEmpty()
  @IsNumber()
  userid: number;
  @IsNotEmpty()
  altPassword: string;
  @IsNotEmpty()
  newPassword: string;
}
