import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { BestellungenService } from './bestellungen.service';
import { env } from 'src/env/env';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';

@Controller('order')
//@UseGuards(JwtAuthGuard)
export class BestellungenController {
    constructor(private readonly service: BestellungenService){}
    @Get()
    async getClinet() {
        const client_id = env.CLIENT_ID;
   
            const clientToken = await this.service.generateClientToken();
            return {
                client_id,
                clientToken
            }
    }
    @Post('create')
    async createOrder(@Body() order: any) {  
           return await this.service.createOrder(order);
    }
    @Post('capture')
    async capturePayment(@Body() data: Payid ) {
            return await this.service.capturePayment(data);
    }
}
