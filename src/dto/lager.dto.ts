import { IsNotEmpty, IsOptional } from "class-validator";
import { Stellplatze } from "src/entity/stellplatzeEntity";

export class LagerDto {
    @IsOptional()
    id?: number;
    @IsNotEmpty()
    name: string;
    lagerorte: Stellplatze[];
    @IsNotEmpty()
    adresse: string;
}