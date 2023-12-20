import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { ProduktVariations } from 'src/entity/produktVariations';
import { VariationService } from './variation.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteFileDto } from 'src/dto/deleteFilde.dto';
import { PhotoService } from 'src/service/photoService';
import { Readable } from 'stream';

@Controller('variation')
export class VariationController {
  constructor(
    private readonly produktVariationsService: VariationService,
    private readonly photoService: PhotoService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  create(@Body() produktVariations: ProduktVariations) {
    return this.produktVariationsService.create(produktVariations);
  }

  @Delete(':sku')
  @UseGuards(JwtAuthGuard)
  delete(@Param('sku') sku: string) {
    return this.produktVariationsService.delete(sku);
  }

  @Put(':sku')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('sku') sku: string,
    @Body() produktVariations: Partial<ProduktVariations>,
  ) {
    return this.produktVariationsService.update(sku, produktVariations);
  }
  @Post('upload/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg)',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
  ): Promise<{ imageid: string }> {
    try {
      const saved = await this.photoService.savePhoto(file);
      const dbsave = await this.produktVariationsService.addImage(
        saved.imageid,
        id,
      );
      if (!dbsave) {
        const del: DeleteFileDto = {
          produktid: id,
          fileid: saved.imageid,
        };
        await this.produktVariationsService.deleteImage(del);
        await this.photoService.deletePhoto(del);
        throw new HttpException(
          'Image wurde nicht gespeichert',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return saved;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  @Post('uploads/')
  async getImage(@Body() id: { id: string }, @Res() res: Response) {
    if (id.id.split('//')[0] === 'https:') {
      const imagestream = await this.getEbayImage(id.id);
      imagestream.pipe(res as any);
    }

    const imageStream = await this.photoService.getPhoto(id.id, false);
    imageStream.pipe(res as any);
  }
  @Post('thumbnails/')
  async getThumbnails(@Body() id: { id: string }, @Res() res: Response) {
    if (id.id && id.id.split('//')[0] === 'https:') {
      const imagestream = await this.getEbayImage(id.id);
      imagestream.pipe(res as any);
    }

    const imageStream = await this.photoService.getPhoto(id.id, true);
    imageStream.pipe(res as any);
  }
  @Post('file-delete')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Body() delFile: DeleteFileDto) {
    const done = await this.produktVariationsService.deleteImage(delFile);
    this.photoService.deletePhoto(delFile);
    if (done) {
      return 1;
    }

    return 0;
  }
  //get image from ebay
  async getEbayImage(id: string) {
    try {
      const item = await fetch(id.split('?')[0], {
        method: 'GET',
      });
      const stream = Readable.fromWeb(item.body as any);
      return stream;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
  @Post('imagelink')
  @UseGuards(JwtAuthGuard)
  saveImageLink(@Body() imglink: { link: string; id: string }) {
    return this.produktVariationsService.saveImageEbayLink(imglink);
  }
}
