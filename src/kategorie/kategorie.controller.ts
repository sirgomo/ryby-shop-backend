import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Kategorie } from 'src/entity/kategorieEntity';
import { KategorieService } from './kategorie.service';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

@Controller('kategorie')
export class KategorieController {
  constructor(private readonly kategorieService: KategorieService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() categoryData: Partial<Kategorie>): Promise<Kategorie> {
    return this.kategorieService.createCategory(categoryData);
  }

  @Get(':id')
  getCategoryById(@Param('id') id: number): Promise<Kategorie | undefined> {
    return this.kategorieService.getCategoryById(id);
  }

  @Get()
  getAllCategories(): Promise<Kategorie[]> {
    return this.kategorieService.getAllCategories();
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateCategory(
    @Param('id') id: number,
    @Body() categoryData: Partial<Kategorie>,
  ): Promise<Kategorie | undefined> {
    return this.kategorieService.updateCategory(id, categoryData);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteCategory(@Param('id') id: number): Promise<boolean> {
    return this.kategorieService.deleteCategory(id);
  }
  @UseGuards(JwtAuthGuard)
  @Post(':categoryId/products/:productId')
  addProductToCategory(
    @Param('categoryId') categoryId: number,
    @Param('productId') productId: number,
  ): Promise<Kategorie | undefined> {
    return this.kategorieService.addProductToCategory(categoryId, productId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':categoryId/products/:productId')
  removeProductFromCategory(
    @Param('categoryId') categoryId: number,
    @Param('productId') productId: number,
  ): Promise<Kategorie | undefined> {
    return this.kategorieService.removeProductFromCategory(
      categoryId,
      productId,
    );
  }
}
