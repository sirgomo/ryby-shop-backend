import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('waren-ausgang-buchen')
@UseGuards(JwtAuthGuard)
export class WarenAusgangBuchenController {}
