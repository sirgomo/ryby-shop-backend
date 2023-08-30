import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { Repository } from 'typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';

describe('ProductService', () => {
  let productService: ProductService;
  let produktRepository: Repository<Produkt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    produktRepository = module.get<Repository<Produkt>>(getRepositoryToken(Produkt));
  });

  describe('getAllProdukte', () => {
    it('should return an array of products', async () => {
      const products: Produkt[] = [
        {
          id: 1,
          name: 'Product 1',
          preis: 10,
          beschreibung: 'Description 1',
          foto: 'photo1.jpg',
          thumbnail: 'thumbnail1.jpg',
          lieferant: null,
          lagerorte: [],
          bestellungen: [],
          datumHinzugefuegt: new Date('2021-01-01'),
          kategorie: [],
          verfgbarkeit: true,
          mindestmenge: 5,
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
        {
          id: 2,
          name: 'Product 2',
          preis: 20,
          beschreibung: 'Description 2',
          foto: 'photo2.jpg',
          thumbnail: 'thumbnail2.jpg',
          lieferant: null,
          lagerorte: [],
          bestellungen: [],
          datumHinzugefuegt: new Date('2021-02-01'),
          kategorie: [],
          verfgbarkeit: true,
          mindestmenge: 10,
          verkaufteAnzahl: 0,
          wareneingang: [],
          warenausgang: [],
          mehrwehrsteuer: 0,
          promocje: [],
          
          bewertung: [],
          artid: 0,
          color: '',
          lange: 10,
          gewicht: 20,
          currentmenge: 15,
          product_sup_id: 'ak30'
        },
      ];

      jest.spyOn(produktRepository, 'find').mockResolvedValue(products);

      const result = await productService.getAllProdukte('null', 0, 20, 1);

      expect(result).toEqual(products);
      expect(produktRepository.find).toHaveBeenCalled();
    });

    it('should throw an exception if there is an error', async () => {
      jest.spyOn(produktRepository, 'find').mockRejectedValue(new Error('Test Error'));

      await expect(productService.getAllProdukte('null', 0, 20, 1)).rejects.toThrowError(HttpException);
      expect(produktRepository.find).toHaveBeenCalled();
    });
  });

  describe('getProduktById', () => {
    it('should return a product with the given id', async () => {
      const product: Produkt = {
        id: 1,
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: new Date('2021-01-01'),
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
        
        bewertung: [],
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: '',
        lange: 0,
        gewicht: 0
      };

      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(product);

      const result = await productService.getProduktById(1);

      expect(result).toEqual(product);
      expect(produktRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: {
        bestellungen: true,
        lieferant: true,
        kategorie: true,
        warenausgang: true,
        wareneingang: true,
        promocje: true,
       
        bewertung: true,
      } });
    });

    it('should return null if the product is not found', async () => {
      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(null);

      await expect(productService.getProduktById(1)).resolves.toEqual(null);
      expect(produktRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: {
        bestellungen: true,
        lieferant: true,
        kategorie: true,
        warenausgang: true,
        wareneingang: true,
        promocje: true,
      
        bewertung: true,
      } });
    });

    it('should throw an exception if there is an error', async () => {
      jest.spyOn(produktRepository, 'findOne').mockRejectedValue(new Error('Test Error'));

      await expect(productService.getProduktById(1)).rejects.toThrowError(HttpException);
      expect(produktRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: {
        bestellungen: true,
        lieferant: true,
        kategorie: true,
        warenausgang: true,
        wareneingang: true,
        promocje: true,
       
        bewertung: true,
      } });
    });
  });

  describe('createProdukt', () => {
    it('should create and return a new product', async () => {
      const productDto: ProductDto = {
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '2021-01-01',
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
     
        bewertung: [],
        id: 0,
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: ''
      };

      const createdProduct: Produkt = {
        id: 1,
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: new Date('2021-01-01'),
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
    
        bewertung: [],
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: '',
        lange: 0,
        gewicht: 0
      };

      jest.spyOn(produktRepository, 'create').mockReturnValue(createdProduct);
      jest.spyOn(produktRepository, 'save').mockResolvedValue(createdProduct);

      const result = await productService.createProdukt(productDto);

      expect(result).toEqual(createdProduct);
      expect(produktRepository.create).toHaveBeenCalledWith(productDto);
      expect(produktRepository.save).toHaveBeenCalledWith(createdProduct);
    });

    it('should throw an exception if there is an error', async () => {
      const productDto: ProductDto = {
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '2021-01-01',
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
     
        bewertung: [],
        id: undefined,
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: ''
      };
      const productEn: Produkt = {
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: new Date('2021-01-01'),
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
       
        bewertung: [],
        id: undefined,
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: '',
        lange: 0,
        gewicht: 0
      }

      jest.spyOn(produktRepository, 'create').mockReturnValue(productEn);
      jest.spyOn(produktRepository, 'save').mockRejectedValue(new Error('Test Error'));

      await expect(productService.createProdukt(productDto)).rejects.toThrowError(HttpException);
      expect(produktRepository.create).toHaveBeenCalledWith(productDto);
      expect(produktRepository.save).toHaveBeenCalledWith(productEn);
    });
  });

  describe('updateProdukt', () => {
    it('should update and return the updated product', async () => {
      const productDto: ProductDto = {
        name: 'Merged Product',
        preis: 15,
        beschreibung: 'Merged Description',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '2021-01-01',
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
       
        bewertung: [],
        id: 1,
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: ''
      };

      const updatedProduct: Produkt = {
        id: 1,
        name: 'Updated Product',
        preis: 10,
        beschreibung: 'Updated Description',
        foto: 'updatedphoto.jpg',
        thumbnail: 'updatedthumbnail.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: new Date('2021-01-01'),
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
      
        bewertung: [],
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: '',
        lange: 0,
        gewicht: 0
      };
      const mergedEntity: Produkt = {
        id: 1,
        name: 'Merged Product',
        preis: 15,
        beschreibung: 'Merged Description',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: new Date('2021-01-01'),
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
       
        bewertung: [],
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: '',
        lange: 0,
        gewicht: 0
      };

      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(updatedProduct);
      jest.spyOn(produktRepository, 'merge').mockImplementation((entity, dto) => {
        entity.name = dto.name;
        entity.preis = dto.preis;
        entity.beschreibung = dto.beschreibung;
        entity.foto = dto.foto;
        entity.thumbnail = dto.thumbnail;
        return entity;
      });
      jest.spyOn(produktRepository, 'save').mockResolvedValue(mergedEntity);

      const result = await productService.updateProdukt(1, productDto);

      expect(result).toEqual(updatedProduct);
      expect(produktRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(produktRepository.merge).toHaveBeenCalledWith(updatedProduct, productDto);
      expect(produktRepository.save).toHaveBeenCalledWith(mergedEntity);
    });

    it('should throw an exception if the product is not found', async () => {
      const productDto: ProductDto = {
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '2021-01-01',
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
      
        bewertung: [],
        id: 0,
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: ''
      };

      jest.spyOn(produktRepository, 'findOne').mockResolvedValue(null);

      await expect(productService.updateProdukt(1, productDto)).rejects.toThrowError(HttpException);
      expect(produktRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an exception if there is an error', async () => {
      const productDto: ProductDto = {
        name: 'Product 1',
        preis: 10,
        beschreibung: 'Description 1',
        foto: 'photo1.jpg',
        thumbnail: 'thumbnail1.jpg',
        lieferant: null,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '2021-01-01',
        kategorie: [],
        verfgbarkeit: true,
        mindestmenge: 5,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
      
        bewertung: [],
        id: 0,
        artid: 0,
        color: '',
        currentmenge: 0,
        product_sup_id: ''
      };

      jest.spyOn(produktRepository, 'findOne').mockRejectedValue(new Error('Test Error'));

      await expect(productService.updateProdukt(1, productDto)).rejects.toThrowError(HttpException);
      expect(produktRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('deleteProdukt', () => {
    it('should delete the product with the given id', async () => {
      jest.spyOn(produktRepository, 'delete').mockResolvedValue(undefined);

      await productService.deleteProdukt(1);

      expect(produktRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an exception if there is an error', async () => {
      jest.spyOn(produktRepository, 'delete').mockRejectedValue(new Error('Test Error'));

      await expect(productService.deleteProdukt(1)).rejects.toThrowError(HttpException);
      expect(produktRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});