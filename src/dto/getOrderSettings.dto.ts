import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetOrderSettingsDto {
  @IsNotEmpty({ message: 'State darf nicht leer sein !' })
  state: string;
  @IsNotEmpty({ message: 'State darf nicht leer sein !' })
  status: string;
  @IsNumber()
  itemsProSite: number;
  @IsOptional()
  @IsNumber()
  sitenr: number;
}
