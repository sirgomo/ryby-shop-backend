import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
} from 'class-validator';

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

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsNotEmpty()
  registrierungsdatum: Date;

  @IsNotEmpty()
  treuepunkte: number;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  l_strasse: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  l_hausnummer: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  l_stadt: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  l_postleitzahl: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  l_land: string;

  @IsNotEmpty()
  @IsString()
  adresseStrasse: string;

  @IsNotEmpty()
  @IsString()
  adresseHausnummer: string;

  @IsNotEmpty()
  @IsString()
  adresseStadt: string;

  @IsNotEmpty()
  @IsString()
  adressePostleitzahl: string;

  @IsNotEmpty()
  @IsString()
  adresseLand: string;
}
