import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseFilePipeBuilder, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProductService } from './product.service';
import { PhotoService } from 'src/service/photoService';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteResult } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { DeleteFileDto } from 'src/dto/deleteFilde.dto';



@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService, private readonly photoService: PhotoService) {}
    @UseGuards(JwtAuthGuard)
    @Get(':search/:katid/:pagecount/:pagenr')
    async getAllProducts(@Param('search') search: string, @Param('katid') katid: number, @Param('pagecount') pagecount: number, @Param('pagenr') pagenr: number): Promise<Produkt[]> {
      return await this.productService.getAllProdukte(search, katid, pagecount, pagenr);
    }
    @Get('kunde/:search/:katid/:pagecount/:pagenr')
    async getAllProductsForKunden(@Param('search') search: string, @Param('katid') katid: number, @Param('pagecount') pagecount: number, @Param('pagenr') pagenr: number): Promise<Produkt[]> {
      return await this.productService.getAllProdukteForKunden(search, katid, pagecount, pagenr);
    }
    @Get(':id')
    async getProductById(@Param('id') id: number): Promise<Produkt> {
      return await this.productService.getProduktById(id);
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
    @Post('upload/:id')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('photo'))
    async uploadPhoto(@UploadedFile( 
        new ParseFilePipeBuilder().addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .build({
            errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE
        })
    ) file: Express.Multer.File, @Param('id') id: number): Promise<{ imageid: string }> {
      const saved = await this.photoService.savePhoto(file);
      if(!this.productService.addImage(saved.imageid, id)) {
        const del : DeleteFileDto = {
          produktid: id,
          fileid: saved.imageid,
        }
        await this.productService.deleteImage(del);
        await this.photoService.deletePhoto(del);
        throw new HttpException('Image wurde nicht gespeichert', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return saved;
    }
    @Get('uploads/:id')
    async getImage(@Param('id') id, @Res() res: Response) {
      const imageStream = await this.photoService.getPhoto(id, false);
      imageStream.pipe(res as any);
    }
    @Get('thumbnails/:id')
    async getThumbnails(@Param('id') id, @Res() res: Response) {
      const imageStream = await this.photoService.getPhoto(id, true);
      imageStream.pipe(res as any);
    }
    @Post('file-delete')
    @UseGuards(JwtAuthGuard)
    async deleteFile(@Body() delFile: DeleteFileDto) {
      if(this.productService.deleteImage(delFile))
       return await this.photoService.deletePhoto(delFile);

       return 0;
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
