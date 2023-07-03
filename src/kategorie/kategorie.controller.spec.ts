import { Test, TestingModule } from '@nestjs/testing';
import { KategorieController } from './kategorie.controller';
import { KategorieService } from './kategorie.service';
import { Kategorie } from 'src/entity/kategorieEntity';

describe('KategorieController', () => {
  let controller: KategorieController;
  let service: KategorieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategorieController],
      providers: [
        {
          provide: KategorieService,
          useValue: {
            createCategory: jest.fn(),
            getCategoryById: jest.fn(),
            getAllCategories: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            addProductToCategory: jest.fn(),
            removeProductFromCategory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<KategorieController>(KategorieController);
    service = module.get<KategorieService>(KategorieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCategory', () => {
    it('should call service createCategory with correct data', async () => {
      const categoryData = { name: 'Test Category' };
      const createdCategory: Kategorie = {
        id: 1,
        name: 'Test Category',
        parent_id: 0,
        products: [],
      };

      jest.spyOn(service, 'createCategory').mockResolvedValue(createdCategory);

      const result = await controller.createCategory(categoryData);

      expect(service.createCategory).toHaveBeenCalledWith(categoryData);
      expect(result).toEqual(createdCategory);
    });
  });

  describe('getCategoryById', () => {
    it('should call service getCategoryById with correct id', async () => {
      const categoryId = 1;
      const category: Kategorie = {
        id: 1,
        name: 'Test Category',
        parent_id: 0,
        products: [],
      };

      jest.spyOn(service, 'getCategoryById').mockResolvedValue(category);

      const result = await controller.getCategoryById(categoryId);

      expect(service.getCategoryById).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(category);
    });
  });

  describe('getAllCategories', () => {
    it('should call service getAllCategories', async () => {
      const categories: Kategorie[] = [
        {
          id: 1,
          name: 'Category 1',
          parent_id: 0,
          products: [],
        },
        {
          id: 2,
          name: 'category 2',
          parent_id: 0,
          products: [],
        },
      ];

      jest.spyOn(service, 'getAllCategories').mockResolvedValue(categories);

      const result = await controller.getAllCategories();

      expect(service.getAllCategories).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('updateCategory', () => {
    it('should call service updateCategory with correct id and data', async () => {
      const categoryId = 1;
      const categoryData: Partial<Kategorie> = { name: 'Updated Category' };
      const updatedCategory: Kategorie = {
        id: 1,
        name: 'Updated Category',
        parent_id: 0,
        products: [],
      };

      jest.spyOn(service, 'updateCategory').mockResolvedValue(updatedCategory);

      const result = await controller.updateCategory(categoryId, categoryData);

      expect(service.updateCategory).toHaveBeenCalledWith(
        categoryId,
        categoryData,
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should call service deleteCategory with correct id', async () => {
      const categoryId = 1;

      jest.spyOn(service, 'deleteCategory').mockResolvedValue(true);

      const result = await controller.deleteCategory(categoryId);

      expect(service.deleteCategory).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(true);
    });
  });

  describe('addProductToCategory', () => {
    it('should call service addProductToCategory with correct category and product ids', async () => {
      const categoryId = 1;
      const productId = 1;
      const updatedCategory: Kategorie = {
        id: 1,
        name: 'Test Category',
        parent_id: 0,
        products: [],
      };

      jest
        .spyOn(service, 'addProductToCategory')
        .mockResolvedValue(updatedCategory);

      const result = await controller.addProductToCategory(
        categoryId,
        productId,
      );

      expect(service.addProductToCategory).toHaveBeenCalledWith(
        categoryId,
        productId,
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('removeProductFromCategory', () => {
    it('should call service removeProductFromCategory with correct category and product ids', async () => {
      const categoryId = 1;
      const productId = 1;
      const updatedCategory: Kategorie = {
        id: 1,
        name: 'Test Category',
        parent_id: 0,
        products: [],
      };

      jest
        .spyOn(service, 'removeProductFromCategory')
        .mockResolvedValue(updatedCategory);

      const result = await controller.removeProductFromCategory(
        categoryId,
        productId,
      );

      expect(service.removeProductFromCategory).toHaveBeenCalledWith(
        categoryId,
        productId,
      );
      expect(result).toEqual(updatedCategory);
    });
  });
});
