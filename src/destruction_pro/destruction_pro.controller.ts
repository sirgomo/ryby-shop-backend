import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { DestructionProService } from './destruction_pro.service';
import { Destruction_protocolDTO } from 'src/dto/destruction_protocol.dto';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('destruction-pro')
@UseGuards(JwtAuthGuard)
export class DestructionProController {
    constructor(private readonly service: DestructionProService) {}

    @Get()
    async getProtocols(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        return await this.service.getProtocols(page, limit);
    }

    @Get(':id')
    async getProtocolById(@Param('id') id: number) {
        return await this.service.getProtocById(id);
    }

    @Post()
    async createProtocol(@Body(ValidationPipe) protocol: Destruction_protocolDTO) {
        return await this.service.createProtocol(protocol);
    }

    @Delete(':id')
    async deleteProtocolById(@Param('id') id: number) {
        return await this.service.deleteProtocolById(id);
    }

    @Put(':id')
    async editProtocol(@Param('id') id: number, @Body(ValidationPipe) protocol: Destruction_protocolDTO) {
        protocol.id = id; // Ensure the DTO has the correct ID
        return await this.service.editProtocol(protocol);
    }
}
