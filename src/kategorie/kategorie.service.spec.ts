import { Test, TestingModule } from '@nestjs/testing';
import { KategorieService } from './kategorie.service';
import { Kategorie } from 'src/entity/kategorieEntity';
import { Produkt } from 'src/entity/produktEntity';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('KategorieService', () => {
  let kategorieService: KategorieService;
  let kategorieRepository: Repository<Kategorie>;
  let produktRepository: Repository<Produkt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KategorieService,
        {
          provide: getRepositoryToken(Kategorie),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
      ],
    }).compile();

    kategorieService = module.get<KategorieService>(KategorieService);
    kategorieRepository = module.get<Repository<Kategorie>>(
      getRepositoryToken(Kategorie),
    );
    produktRepository = module.get<Repository<Produkt>>(
      getRepositoryToken(Produkt),
    );
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const categoryData: Partial<Kategorie> = {
        name: 'Category1',
      };

      const createdCategory: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [],
        parent_id: 0,
      };

      jest
        .spyOn(kategorieRepository, 'create')
        .mockReturnValue(createdCategory);
      jest
        .spyOn(kategorieRepository, 'save')
        .mockResolvedValue(createdCategory);

      const result = await kategorieService.createCategory(categoryData);

      expect(result).toEqual(createdCategory);
      expect(kategorieRepository.create).toHaveBeenCalledWith(categoryData);
      expect(kategorieRepository.save).toHaveBeenCalledWith(createdCategory);
    });

    it('should throw an error if category creation fails', async () => {
      const categoryData: Partial<Kategorie> = {
        name: 'Category1',
      };

      jest.spyOn(kategorieRepository, 'create').mockImplementation(() => {
        throw new Error();
      });

      await expect(
        kategorieService.createCategory(categoryData),
      ).rejects.toThrowError();
    });
  });

  describe('getCategoryById', () => {
    it('should return the category with the specified id', async () => {
      const categoryId = 1;

      const category: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [],
        parent_id: 0,
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(category);

      const result = await kategorieService.getCategoryById(categoryId);

      expect(result).toEqual(category);
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should return undefined if the category is not found', async () => {
      const categoryId = 1;

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(undefined);

      const result = await kategorieService.getCategoryById(categoryId);

      expect(result).toBeUndefined();
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const categories: Kategorie[] = [
        {
          id: 1,
          name: 'Category1',
          products: [],
          parent_id: 0,
        },
        {
          id: 2,
          name: 'Category2',
          products: [],
          parent_id: 0,
        },
      ];

      jest.spyOn(kategorieRepository, 'find').mockResolvedValue(categories);

      const result = await kategorieService.getAllCategories();

      expect(result).toEqual(categories);
      expect(kategorieRepository.find).toHaveBeenCalled();
    });

    it('should throw an error if fetching categories fails', async () => {
      jest.spyOn(kategorieRepository, 'find').mockImplementation(() => {
        throw new Error();
      });

      await expect(kategorieService.getAllCategories()).rejects.toThrowError();
    });
  });

  describe('updateCategory', () => {
    it('should update the category with the specified id', async () => {
      const categoryId = 1;
      const categoryData: Partial<Kategorie> = {
        name: 'Category1 Updated',
      };

      const category: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [],
        parent_id: 0,
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(category);
      jest
        .spyOn(kategorieRepository, 'merge')
        .mockImplementation((category, categoryData) => {
          category.name = categoryData.name;
          return category;
        });
      jest.spyOn(kategorieRepository, 'save').mockResolvedValue(category);

      const result = await kategorieService.updateCategory(
        categoryId,
        categoryData,
      );

      expect(result).toEqual(category);
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(kategorieRepository.merge).toHaveBeenCalledWith(
        category,
        categoryData,
      );
      expect(kategorieRepository.save).toHaveBeenCalledWith(category);
    });

    it('should return undefined if the category is not found', async () => {
      const categoryId = 1;
      const categoryData: Partial<Kategorie> = {
        name: 'Category1 Updated',
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(undefined);

      const result = await kategorieService.updateCategory(
        categoryId,
        categoryData,
      );

      expect(result).toBeUndefined();
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
    });

    it('should throw an error if category update fails', async () => {
      const categoryId = 1;
      const categoryData: Partial<Kategorie> = {
        name: 'Category1 Updated',
      };

      const category: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [],
        parent_id: 0,
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(category);
      jest.spyOn(kategorieRepository, 'merge').mockImplementation(() => {
        throw new Error();
      });

      await expect(
        kategorieService.updateCategory(categoryId, categoryData),
      ).rejects.toThrowError();
    });
  });

  describe('deleteCategory', () => {
    it('should delete the category with the specified id', async () => {
      const categoryId = 1;

      const deleteResult: DeleteResult = {
        affected: 1,
        raw: undefined,
      };

      jest.spyOn(kategorieRepository, 'delete').mockResolvedValue(deleteResult);

      const result = await kategorieService.deleteCategory(categoryId);

      expect(kategorieRepository.delete).toHaveBeenCalledWith(categoryId);
      expect(result).toBe(true);
    });

    it('should return false if the category is not found', async () => {
      const categoryId = 1;

      const deleteResult: DeleteResult = {
        affected: 0,
        raw: undefined,
      };

      jest.spyOn(kategorieRepository, 'delete').mockResolvedValue(deleteResult);

      const result = await kategorieService.deleteCategory(categoryId);

      expect(result).toBe(false);
      expect(kategorieRepository.delete).toHaveBeenCalledWith(categoryId);
    });

    it('should throw an error if category deletion fails', async () => {
      const categoryId = 1;

      jest.spyOn(kategorieRepository, 'delete').mockRejectedValue(new Error());

      await expect(
        kategorieService.deleteCategory(categoryId),
      ).rejects.toThrowError();
    });
  });

  describe('addProductToCategory', () => {
    it('should add the product to the category', async () => {
      const categoryId = 1;
      const productId = 1;

      const category: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [],
        parent_id: 0,
      };

      const product: Produkt = {
        id: 1,
        name: 'Product1',
        preis: 10,
        beschreibung: 'Description1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: new Date(),
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 1,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
      
        bewertung: [],
        artid: 0,
        color: '',
        lange: 20,
        gewicht: 30,
        currentmenge: 10,
        product_sup_id: 'ak20'
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(category);
      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(product);
      jest.spyOn(kategorieRepository, 'save').mockResolvedValue(category);

      const result = await kategorieService.addProductToCategory(
        categoryId,
        productId,
      );

      expect(result).toEqual(category);
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
      expect(produktRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(kategorieRepository.save).toHaveBeenCalledWith(category);
    });

    it('should return undefined if the category is not found', async () => {
      const categoryId = 1;
      const productId = 1;

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(null);

      const result = await kategorieService.addProductToCategory(
        categoryId,
        productId,
      );

      expect(result).toBeUndefined();
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
    });

    it('should return undefined if the product is not found', async () => {
      const categoryId = 1;
      const productId = 1;

      const category: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [],
        parent_id: 0,
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(category);
      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(null);

      const result = await kategorieService.addProductToCategory(
        categoryId,
        productId,
      );

      expect(result).toBeUndefined();
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
      expect(produktRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('removeProductFromCategory', () => {
    it('should remove the product from the category', async () => {
      const categoryId = 1;
      const productId = 1;

      const category: Kategorie = {
        id: 1,
        name: 'Category1',
        products: [
          {
            id: 1,
            name: 'Product1',
            preis: 10,
            beschreibung: 'Description1',
            foto: 'photo1.jpg',
            thumbnail: 'thumbnail1.jpg',
            lieferant: null,
            lagerorte: [],
            bestellungen: [],
            datumHinzugefuegt: new Date(),
            kategorie: [],
            verfgbarkeit: true,
            mindestmenge: 1,
            verkaufteAnzahl: 0,
            wareneingang: [],
            warenausgang: [],
            mehrwehrsteuer: 0,
            promocje: [],
            
            bewertung: [],
            artid: 0,
            color: '',
            lange: 20,
            gewicht: 30,
            currentmenge: 10,
            product_sup_id: 'ak20'
          },
        ],
        parent_id: 0,
      };

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(category);
      jest.spyOn(kategorieRepository, 'save').mockResolvedValue(category);

      const result = await kategorieService.removeProductFromCategory(
        categoryId,
        productId,
      );

      expect(result).toEqual(category);
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
      expect(kategorieRepository.save).toHaveBeenCalledWith(category);
    });

    it('should return undefined if the category is not found', async () => {
      const categoryId = 1;
      const productId = 1;

      jest.spyOn(kategorieRepository, 'findOne').mockResolvedValue(undefined);

      const result = await kategorieService.removeProductFromCategory(
        categoryId,
        productId,
      );

      expect(result).toBeUndefined();
      expect(kategorieRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: {
          products: true,
        },
      });
    });
  });
});
