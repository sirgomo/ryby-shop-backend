import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import fsExtra from 'fs-extra';
import sharp from "sharp";

@Injectable()
export class PhotoService {
    savePhoto(file): string {
        const uniqueName = uuidv4();
        const uploadPath = path.resolve(__dirname, '..', 'uploads');
        const thumbnailPath = path.resolve(__dirname, '..', 'thumbnails');
    
        // Sprawdź czy plik już istnieje
        const existingFiles = fsExtra.readdirSync(uploadPath);
        const ext = file.originalname.split('.').pop().toLowerCase();
        const originalName = `${uniqueName}.${ext}`;
        if (existingFiles.includes(originalName)) {
          throw new Error('Plik o takiej nazwie już istnieje.');
        }
    
        // Zapisz oryginalne zdjęcie
        const originalFilePath = path.join(uploadPath, originalName);
        fsExtra.writeFileSync(originalFilePath, file.buffer);
    
        // Utwórz miniaturkę
        const thumbnailName = `${uniqueName}_thumbnail.${ext}`;
        const thumbnailFilePath = path.join(thumbnailPath, thumbnailName);
        sharp(file.buffer)
          .resize(250, 250)
          .toFile(thumbnailFilePath, (error) => {
            if (error) {
              throw new Error('Błąd podczas tworzenia miniaturki.');
            }
          });
    
        // Zmień uprawnienia plików na serwerze Linux
        fsExtra.chmodSync(originalFilePath, '644');
        fsExtra.chmodSync(thumbnailFilePath, '644');
    
        return originalName;
      }
}