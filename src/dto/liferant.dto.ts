import { IsNotEmpty, IsEmail, IsPhoneNumber, IsOptional, Matches } from "class-validator";
import { AddressDto } from "./adress.dto";

export class LieferantDto {
    id: number | undefined;

    @IsNotEmpty()
    @Matches(/^[a-zA-Z ]{5,40}$/)
    name: string;

    @IsEmail()
    email: string;

    @Matches(/^[0-9+]{6,14}$/)
    telefon: string;

    @IsOptional()
    adresse: AddressDto | undefined;

    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9\/]{6,14}$/)
    steuernummer: string;

    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9\/]{10,30}$/)
    bankkontonummer: string;

    @IsNotEmpty()
    ansprechpartner: string;

    @IsNotEmpty()
    zahlart: string;

    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9\/-]{8,15}$/)
    umsatzsteuerIdentifikationsnummer: string;
  }