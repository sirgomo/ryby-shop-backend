import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";

//import * as sharp from "sharp";
import { createReadStream, unlinkSync } from "fs";
import { DeleteFileDto } from "src/dto/deleteFilde.dto";

@Injectable()
export class PhotoService {
  fsExtra = require('fs-extra');

  async savePhoto(file): Promise<{ imageid: string}> {
    const sharp = (await import('sharp')).default;
    try {
      const uniqueName = uuidv4();
      const uploadPath = path.resolve(__dirname, '../../', 'uploads');
      const thumbnailPath = path.resolve(__dirname, '../../', 'thumbnails');
  
     // Create the 'uploads' directory if it doesn't exist
     this.fsExtra.ensureDirSync(uploadPath);
     this.fsExtra.ensureDirSync(thumbnailPath);
  
      const existingFiles = this.fsExtra.readdirSync(uploadPath);
      const ext = file.originalname.split('.').pop().toLowerCase();
      const originalName = `${uniqueName}.${ext}`;
     
      const originalFilePath = path.join(uploadPath, originalName);
     // this.fsExtra.writeFileSync(originalFilePath, file.buffer);
     sharp(file.buffer)
     .resize({
      fit: sharp.fit.contain,
      height: 1024,
      width: 1024
     })
     .toFile(originalFilePath, (error) => {
       if (error) {
           throw new HttpException('Fehler beim Erstellen des Bildes.', HttpStatus.BAD_REQUEST);
       }
     });

     
    
      const thumbnailFilePath = path.join(thumbnailPath, originalName);
      sharp(file.buffer)
      .resize({
        fit: sharp.fit.contain,
        height: 300,
        width: 300
       })
        .toFile(thumbnailFilePath, (error) => {
          if (error) {
              throw new HttpException('Fehler beim Erstellen des Thumbnails.', HttpStatus.BAD_REQUEST);
          }
        });
  

  
      return  { imageid: originalName};
    } catch (err) {
      throw err;
    }
       
  }
      getPhoto(id: string, thum: boolean) {
      try {
        const uploadPath = path.resolve(__dirname, '../../', 'uploads');
        const thumbnailPath = path.resolve(__dirname, '../../', 'thumbnails');
        if(!thum) {
          const imgpath = path.join(uploadPath, id);
          const stream =  createReadStream(imgpath);
          stream.on('error', (err) => {
          return err;
          })
          return stream;
        }
        
        const imgpath = path.join(thumbnailPath, id);
        const stream =  createReadStream(imgpath);
        stream.on('error', (err) => {
          return err;
        })
        return stream;
      } catch (err) {
        throw err;
      }
  }
  deletePhoto(file: DeleteFileDto) {
    const uploadPath = path.resolve(__dirname, '../../', 'uploads');
    const thumbnailPath = path.resolve(__dirname, '../../', 'thumbnails');

    const imgpath = path.join(uploadPath, file.fileid);
    const thumpath = path.join(thumbnailPath, file.fileid);
    try {
       unlinkSync(imgpath);
       unlinkSync(thumpath);
    
     return 1;
    } catch (err) {
      console.log(err);
    }
 }
}