import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { ProduktVariations } from 'src/entity/produktVariations';
import { VariationService } from './variation.service';

@Controller('variation')
@UseGuards(JwtAuthGuard)
export class VariationController {
    constructor(private readonly produktVariationsService: VariationService) {}

    @Get()
    findAll() {
        return this.produktVariationsService.findAllforSelect();
    }

    @Get(':variations_name')
    findByVariationsName(@Param('variations_name') variations_name: string) {
        return this.produktVariationsService.findByVariationsName(variations_name);
    }

    @Get(':sku')
    findOne(@Param('sku') sku: string) {
        return this.produktVariationsService.findOne(sku);
    }

    @Post()
    create(@Body() produktVariations: ProduktVariations) {
        return this.produktVariationsService.create(produktVariations);
    }

    @Delete(':sku')
    delete(@Param('sku') sku: string) {
        return this.produktVariationsService.delete(sku);
    }

    @Put(':sku')
    update(@Param('sku') sku: string, @Body() produktVariations: Partial<ProduktVariations>) {
        return this.produktVariationsService.update(sku, produktVariations);
    }
}
