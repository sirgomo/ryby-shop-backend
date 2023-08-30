import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('bestellungen')
@UseGuards(JwtAuthGuard)
export class BestellungenController {}
