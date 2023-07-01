import { Module } from '@nestjs/common';
import { KategorieService } from './kategorie.service';
import { KategorieController } from './kategorie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kategorie } from 'src/entity/kategorieEntity';
import { AuthModule } from 'src/auth/auth.module';
import { Produkt } from 'src/entity/produktEntity';

@Module({
  imports: [TypeOrmModule.forFeature([Kategorie, Produkt]), AuthModule],
  providers: [KategorieService],
  controllers: [KategorieController],
})
export class KategorieModule {}
