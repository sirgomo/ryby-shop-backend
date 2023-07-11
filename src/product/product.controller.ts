import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipe, ParseFilePipeBuilder, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProductService } from './product.service';
import { PhotoService } from 'src/service/photoService';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService, private readonly photoService: PhotoService) {}

    @Get()
    async getAllProducts(): Promise<Produkt[]> {
      return await this.productService.getAllProdukte();
    }
  
    @Get(':id')
    async getProductById(@Param('id') id: number): Promise<Produkt> {
      return await this.productService.getProduktById(id);
    }
  
    @Post()
    async createProduct(@Body() productDto: ProductDto): Promise<Produkt> {
      return await this.productService.createProdukt(productDto);
    }
  
    @Put(':id')
    async updateProduct(
      @Param('id') id: number,
      @Body() productDto: ProductDto,
    ): Promise<Produkt> {
      return await this.productService.updateProdukt(id, productDto);
    }
  
    @Delete(':id')
    async deleteProduct(@Param('id') id: number): Promise<void> {
      return await this.productService.deleteProdukt(id);
    }
    @Post()
    @UseInterceptors(FileInterceptor("photo"))
    async uploadPhoto(@UploadedFile( 
        new ParseFilePipeBuilder().addFileTypeValidator({
            fileType:  '/^jpg$|^png$/',
        }).build({
            errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE
        })
    ) file: Express.Multer.File): Promise<string> {
      return await this.photoService.savePhoto(file);
    }
}
