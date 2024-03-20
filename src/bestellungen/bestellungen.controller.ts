import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { BestellungenService } from './bestellungen.service';
import { env } from 'src/env/env';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';
import { GetOrderSettingsDto } from 'src/dto/getOrderSettings.dto';
import { capturePayment, generateClientToken } from './paypal_function';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

@Controller('order')
export class BestellungenController {
  constructor(
    private readonly service: BestellungenService,
    private readonly logService: LogsService,
  ) {}
  @Get()
  async getClinet() {
    const client_id = env.CLIENT_ID;
    const clientToken = await generateClientToken();
    return {
      client_id,
      clientToken,
    };
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

  @Post('all/get/:sitenr')
  @UseGuards(JwtAuthGuard)
  async getAllOrders(
    @Body(ValidationPipe) items: GetOrderSettingsDto,
    @Param('sitenr') sitenr: number,
  ) {
    return await this.service.getOrders(items, sitenr);
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard)
  async updateOrder(@Body(ValidationPipe) body: OrderDto) {
    return await this.service.updateOrder(body.id, body);
  }
  @Post('create')
  async createOrder(@Body(ValidationPipe) order: OrderDto) {
    return await this.service.createOrder(order);
  }
  @Post('capture')
  async capturePayment(@Body(ValidationPipe) data: Payid) {
    return await capturePayment(data, this.service, this.logService);
  }
  @Post('own-order')
  @UseGuards(JwtAuthGuard)
  async saveOwnOrder(@Body(ValidationPipe) body: OrderDto) {
    return await this.service.saveOwnOrder(body);
  }
}
