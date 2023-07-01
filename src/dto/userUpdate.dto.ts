import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsNumber,
  IsObject,
} from 'class-validator';
import { AdresseKunde } from 'src/entity/addressEntity';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';

export class UserUpdateDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  vorname: string;

  @IsNotEmpty()
  @IsString()
  nachname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  telefon: string;

  @IsObject()
  adresse: AdresseKunde;
  lieferadresse: Lieferadresse;
}
