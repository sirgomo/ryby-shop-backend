import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import * as fsExtra from 'fs-extra';
import * as sharp from "sharp";
import { createReadStream } from "fs";

@Injectable()
export class PhotoService {
   savePhoto(file): { imageid: string} {
    try {
      const uniqueName = uuidv4();
      const uploadPath = path.resolve(__dirname, '../../', 'uploads');
      const thumbnailPath = path.resolve(__dirname, '../../', 'thumbnails');
  
     // Create the 'uploads' directory if it doesn't exist
     fsExtra.ensureDirSync(uploadPath);
     fsExtra.ensureDirSync(thumbnailPath);
  
      const existingFiles = fsExtra.readdirSync(uploadPath);
      const ext = file.originalname.split('.').pop().toLowerCase();
      const originalName = `${uniqueName}.${ext}`;
     
      const originalFilePath = path.join(uploadPath, originalName);
      fsExtra.writeFileSync(originalFilePath, file.buffer);
  
     
    
      const thumbnailFilePath = path.join(thumbnailPath, originalName);
      sharp(file.buffer)
        .resize(250, 250)
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
}