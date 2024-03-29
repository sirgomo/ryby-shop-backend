import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Kategorie } from 'src/entity/kategorieEntity';
import { Produkt } from 'src/entity/produktEntity';
import { Repository } from 'typeorm';

@Injectable()
export class KategorieService {
  constructor(
    @InjectRepository(Kategorie)
    private readonly kategorieRepository: Repository<Kategorie>,
    @InjectRepository(Produkt)
    private readonly produktRepository: Repository<Produkt>,
  ) {}

  async createCategory(categoryData: Partial<Kategorie>): Promise<Kategorie> {
    try {
      const category = await this.kategorieRepository.create(categoryData);
      return await this.kategorieRepository.save(category).then(
        (res) => {
          return res;
        },
        (err) => {
          console.log(err);
          throw new HttpException(
            'Etwas ist schiefgegangen, ich kann neue Category nicht erstellen',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        },
      );
    } catch (err) {
      throw err;
    }
  }

  async getCategoryById(id: number): Promise<Kategorie | undefined> {
    try {
      return await this.kategorieRepository.findOne({ where: { id: id } });
    } catch (error) {
      console.error(error);
    }
  }

  async getAllCategories(): Promise<Kategorie[]> {
    try {
      return await this.kategorieRepository.find();
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(
    id: number,
    categoryData: Partial<Kategorie>,
  ): Promise<Kategorie | undefined> {
    try {
      const category = await this.kategorieRepository.findOne({
        where: { id: id },
      });
      if (!category) {
        return undefined;
      }
      await this.kategorieRepository.merge(category, categoryData);
      return await this.kategorieRepository.save(category).catch((err) => {
        console.log(err);
        throw new HttpException(
          'Etwas ist schiefgelaufen, änderungen wurden nicht gespeichert',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await this.kategorieRepository.delete(id).catch((err) => {
        console.log(err);
        throw new HttpException(
          'Etwas ist schiefgelaufen, post wurde nicht gelöscht',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
      return result.affected > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addProductToCategory(
    categoryId: number,
    productId: number,
  ): Promise<Kategorie | undefined> {
    try {
      const category = await this.kategorieRepository.findOne({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
      if (!category) {
        return undefined;
      }
      const product = await this.produktRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        return undefined;
      }
      category.products.push(product);
      return await this.kategorieRepository.save(category);
    } catch (error) {
      console.error(error);
    }
  }

  async removeProductFromCategory(
    categoryId: number,
    productId: number,
  ): Promise<Kategorie | undefined> {
    try {
      const category = await this.kategorieRepository.findOne({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
      if (!category) {
        return undefined;
      }
      category.products = category.products.filter(
        (product) => product.id !== productId,
      );
      return await this.kategorieRepository.save(category);
    } catch (error) {
      console.error(error);
    }
  }
  async getCategoryWithProducts(): Promise<Kategorie[]> {
    try {
      return await this.kategorieRepository.find({
        relations: {
          products: true,
        },
        select: {
          products: {
            id: true,
          },
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
