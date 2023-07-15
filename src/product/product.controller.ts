import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProductService } from './product.service';
import { PhotoService } from 'src/service/photoService';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { createReadStream } from 'fs';


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
    async deleteProduct(@Param('id') id: number): Promise<DeleteResult> {
      return await this.productService.deleteProdukt(id);
    }
    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('photo'))
    async uploadPhoto(@UploadedFile( 
        new ParseFilePipeBuilder().addFileTypeValidator({
          fileType: 'png',
        })
        .build({
            errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE
        })
    ) file: Express.Multer.File): Promise<{ imageid: string }> {
      return await this.photoService.savePhoto(file);
    }
    @Get('uploads/:id')
    async getImage(@Param('id') id, @Res() res: Response) {
      const imageStream = await this.photoService.getPhoto(id, false);
      imageStream.pipe(res as any);
    } 
}
