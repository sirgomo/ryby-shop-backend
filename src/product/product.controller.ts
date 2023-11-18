import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProductService } from './product.service';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';




@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) {}
    @UseGuards(JwtAuthGuard)
    @Get(':search/:katid/:pagecount/:pagenr')
    async getAllProducts(@Param('search') search: string, @Param('katid') katid: number, @Param('pagecount') pagecount: number, @Param('pagenr') pagenr: number): Promise<[Produkt[], number]> {
      return await this.productService.getAllProdukte(search, katid, pagecount, pagenr);
    }
    @Get('kunde/:search/:katid/:pagecount/:pagenr')
    async getAllProductsForKunden(@Param('search') search: string, @Param('katid') katid: number, @Param('pagecount') pagecount: number, @Param('pagenr') pagenr: number): Promise<[Produkt[], number]> {
      return await this.productService.getAllProdukteForKunden(search, katid, pagecount, pagenr);
    }
    @Get(':id')
    async getProductById(@Param('id') id: number): Promise<Produkt> {
      return await this.productService.getProduktById(id);
    }
    @Get('admin/:id')
    async getAdminProductById(@Param('id') id: number): Promise<Produkt> {
      return await this.productService.getAdminProduktById(id);
    }
  
    @Post()
    @UseGuards(JwtAuthGuard)
    async createProduct(@Body() productDto: ProductDto): Promise<Produkt> {
      return await this.productService.createProdukt(productDto);
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateProduct(
      @Param('id') id: number,
      @Body() productDto: ProductDto,
    ): Promise<Produkt> {
      return await this.productService.updateProdukt(id, productDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteProduct(@Param('id') id: number): Promise<DeleteResult> {
      return await this.productService.deleteProdukt(id);
    }
  
    @Get('lieferant/:id')
    @UseGuards(JwtAuthGuard)
    async getAllProduktsForBuchung(@Param('id') id: number) {
      return await this.productService.getProduktsForBuchung(id);
    }
    @Delete('ean/:id')
    @UseGuards(JwtAuthGuard)
    async deleteEanById(@Param('id') id: number) {
      return await this.productService.deleteEan(id);
    }

}
