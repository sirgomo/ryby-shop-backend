import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { ProductService } from './product.service';
import { MoreThan, Repository } from 'typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';
import { EanEntity } from 'src/entity/eanEntity';
import { ProduktVariations } from 'src/entity/produktVariations';

describe('ProductService', () => {
  let productService: ProductService;
  let produktRepository: Repository<Produkt>;
  let eanRepo: Repository<EanEntity>;
  const prod1: Produkt = {
    id: 1,
    name: 'asdjasdkhakh ',
    sku: '2232asdasd',
    artid: 23213,
    beschreibung: 'hjhgas g hjgasj gh jgjags ljdasg ',
    lieferant: undefined,
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: new Date('2021-01-01'),
    kategorie: [],
    verfgbarkeit: 0,
    product_sup_id: '',
    ebay: 0,
    wareneingang: [],
    mehrwehrsteuer: 0,
    promocje: [],
    bewertung: [],
    eans: [],
    variations: [],
    produkt_image: '',
    shipping_costs: [],
  };
  const prod2: Produkt = {
    id: 2,
    name: 'ljshgaj kjahsd ',
    sku: '876dsjgshd86',
    artid: 553412,
    beschreibung: 'jdhgjlagsdlj jashg ljasgj ',
    lieferant: undefined,
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: new Date('2023-05-05'),
    kategorie: [],
    verfgbarkeit: 0,
    product_sup_id: '',
    ebay: 0,
    wareneingang: [],
    mehrwehrsteuer: 0,
    promocje: [],
    bewertung: [],
    eans: [],
    variations: [],
    produkt_image: '',
    shipping_costs: [],
  };
  const productDto: ProductDto = {
    name: 'Product 1',
    beschreibung: 'Description 1',
    lieferant: null,
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: '2021-01-01',
    kategorie: [],
    wareneingang: [],
    mehrwehrsteuer: 0,
    promocje: [],
    bewertung: [],
    id: 0,
    artid: 0,
    product_sup_id: '',
    sku: '',
    verfgbarkeit: 0,
    ebay: 0,
    eans: [],
    variations: [],
    produkt_image: '',
    shipping_costs: [],
  };
  const products: Produkt[] = [prod1, prod2];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EanEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    productService = module.get<ProductService>(ProductService);
    produktRepository = module.get<Repository<Produkt>>(
      getRepositoryToken(Produkt),
    );
    eanRepo = module.get<Repository<EanEntity>>(getRepositoryToken(EanEntity));
  });

  describe('getAllProdukte', () => {
    it('should return an array of products', async () => {
      jest
        .spyOn(produktRepository, 'findAndCount')
        .mockResolvedValue([products, 1]);

      const result = await productService.getAllProdukte('null', 0, 20, 1);

      expect(result).toEqual([products, 1]);
      expect(produktRepository.findAndCount).toHaveBeenCalled();
    });

    it('should throw an exception if there is an error', async () => {
      jest
        .spyOn(produktRepository, 'findAndCount')
        .mockRejectedValue(new Error('Test Error'));

      await expect(
        productService.getAllProdukte('null', 0, 20, 2),
      ).rejects.toThrow(HttpException);
      expect(produktRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('getProduktById', () => {
    it('should return a product with the given id', async () => {
      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(prod1);

      const result = await productService.getProduktById(1);

      expect(result).toEqual(prod1);
      expect(produktRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          variations: {
            quanity: MoreThan(0),
          },
        },
        relations: {
          bestellungen: true,
          lieferant: true,
          kategorie: true,
          wareneingang: true,
          promocje: true,
          bewertung: true,
          eans: true,
          variations: true,
          shipping_costs: true,
        },
      });
    });

    it('should throw an exception if not found', async () => {
      jest.spyOn(produktRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(productService.getProduktById(1)).rejects.toThrow(
        HttpException,
      );
      expect(produktRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          variations: {
            quanity: MoreThan(0),
          },
        },
        relations: {
          bestellungen: true,
          lieferant: true,
          kategorie: true,
          wareneingang: true,
          promocje: true,
          bewertung: true,
          eans: true,
          variations: true,
          shipping_costs: true,
        },
      });
    });
  });

  describe('createProdukt', () => {
    it('should create and return a new product', async () => {
      jest
        .spyOn(produktRepository, 'create')
        .mockImplementationOnce((entity) => {
          return entity as Produkt;
        });
      jest.spyOn(produktRepository, 'save').mockResolvedValue(prod1);

      const result = await productService.createProdukt(productDto);

      expect(result).toEqual(prod1);
      expect(produktRepository.create).toHaveBeenCalledWith(productDto);
      expect(produktRepository.save).toHaveBeenCalledWith(productDto);
    });
  });

  describe('updateProdukt', () => {
    it('should update and return the updated product', async () => {
      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(prod1);
      jest
        .spyOn(produktRepository, 'merge')
        .mockImplementationOnce((entity, dto) => ({
          ...dto,
          ...entity,
        }));
      jest
        .spyOn(produktRepository, 'save')
        .mockImplementationOnce(async (enttiy) => {
          return enttiy as Produkt;
        });

      const result = await productService.updateProdukt(1, productDto);

      expect(result).toEqual({ ...productDto, ...prod1 });
      expect(produktRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: {
          eans: true,
          variations: true,
        },
      });
      expect(produktRepository.merge).toHaveBeenCalledWith(prod1, productDto);
      expect(produktRepository.save).toHaveBeenCalledWith({
        ...productDto,
        ...prod1,
      });
    });

    it('should throw an exception if there is an error', async () => {
      jest.spyOn(produktRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(productService.updateProdukt(1, productDto)).rejects.toThrow(
        'Produkt nicht gefunden',
      );
    });
  });

  describe('deleteProdukt', () => {
    it('it should throw an error that item was not found', async () => {
      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(null);

      await expect(productService.deleteProdukt(1)).resolves.toThrow(
        'Produkt not found',
      );
    });

    it('should throw an exception if we try to delete produkt with quantity bigger then 0', async () => {
      const varaition: ProduktVariations = {
        sku: 'asdasd',
        produkt: prod1,
        variations_name: 'kshjd akjhd ',
        hint: '',
        value: '',
        unit: '',
        image: '',
        price: 2.2,
        wholesale_price: 0,
        thumbnail: '',
        quanity: 10,
        quanity_sold: 1,
        quanity_sold_at_once: 1,
      };
      prod1.variations = [varaition];
      jest.spyOn(produktRepository, 'findOne').mockResolvedValueOnce(prod1);

      await expect(productService.deleteProdukt(1)).resolves.toThrow(
        'Produkt ' +
          prod1.name +
          ' kann nicht gelöscht werden, die Menge ist gößer als 0 ',
      );
    });
  });
});
