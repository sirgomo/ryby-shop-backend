import { Body, Controller, Get, Param, Patch, Post, Put, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { BestellungenService } from './bestellungen.service';
import { env } from 'src/env/env';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';

@Controller('order')
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
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getOrderById(@Param('id') id: number) {
        return await this.service.getOrderBeiId(id);
    }
 
    @Get('kunde/:id')
    @UseGuards(JwtAuthGuard)
    async getOrderByKundeId(@Param('id') id: number) {
        return await this.service.getOrdersBeiKunde(id);
    }

    @Get('all/get')
    @UseGuards(JwtAuthGuard)
    async getAllOrders() {
      return await this.service.getOrders();
    }
 
    @Patch('update')
    @UseGuards(JwtAuthGuard)
    async updateOrder(@Body(ValidationPipe) body: OrderDto ) {
        return await this.service.updateOrder(body.id, body);
    }
    @Post('create')
    async createOrder(@Body(ValidationPipe) order: OrderDto) {  
           return await this.service.createOrder(order);
    }
    @Post('capture')
    async capturePayment(@Body(ValidationPipe) data: Payid ) {
            return await this.service.capturePayment(data);
    }
  
}
