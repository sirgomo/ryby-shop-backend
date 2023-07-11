import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Lieferant } from 'src/entity/lifernatEntity';
import { LieferantDto } from 'src/dto/liferant.dto';
import { PhotoService } from 'src/service/photoService';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let productService: ProductService;
  let productRepository: Repository<Produkt>;
  const request = require('supertest');
  let photoService: PhotoService;
  
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
        PhotoService
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    productService = moduleFixture.get<ProductService>(ProductService);
    productRepository = moduleFixture.get<Repository<Produkt>>(getRepositoryToken(Produkt));
    photoService = moduleFixture.get<PhotoService>(PhotoService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /product', () => {
    it('should return all products', async () => {
      const prod1: Produkt = {
        id: 1,
        name: 'pipo',
        preis: 0,
        beschreibung: '',
        foto: '',
        thumbnail: '',
        lieferant: new Lieferant,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: undefined,
        kategorie: [],
        verfgbarkeit: false,
        mindestmenge: 0,
        aktion: false,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
        reservation: [],
        bewertung: []
      }
      const prod : Produkt = {
        id: 2,
        name: 'pipo2',
        preis: 0,
        beschreibung: '',
        foto: '',
        thumbnail: '',
        lieferant: new Lieferant,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: undefined,
        kategorie: [],
        verfgbarkeit: false,
        mindestmenge: 0,
        aktion: false,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
        reservation: [],
        bewertung: []
      }
      const mockProducts: Produkt[] = [
    prod, prod1
      ];

      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

      const response = await request(app.getHttpServer()).get('/product').expect(200);

      expect(response.body).toBeInstanceOf(Array);
    
      expect(response.body[0].name).toBe('pipo2');
      expect(response.body[1].name).toBe('pipo');
    });
  });

  describe('GET /product/:id', () => {
    it('should return a product by id', async () => {
      const mockProduct: Produkt = {
        id: 1, name: 'Test Product 1', preis: 9.99,
        beschreibung: 'kawa',
        foto: 'nei mia',
        thumbnail: '',
        lieferant: new Lieferant,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: null,
        kategorie: [],
        verfgbarkeit: false,
        mindestmenge: 0,
        aktion: false,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
        reservation: [],
        bewertung: []
      };
      const productId = 1;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct);

      const response = await request(app.getHttpServer()).get(`/product/${productId}`).expect(200);

      expect(response.body).toMatchObject(mockProduct);
    });

    it('should return 404 if product not found', async () => {
      const productId = -999;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      const res = await request(app.getHttpServer()).get(`/product/${productId}`).expect(200);
      expect(res.body).toStrictEqual({});
    });
  });

  describe('POST /product', () => {
    it('should create a new product', async () => {
      const productDto: ProductDto = {
        name: 'Test Product',
        preis: 9.99,
        beschreibung: 'Test description',
        foto: 'test.jpg',
        thumbnail: 'test_thumbnail.jpg',
        datumHinzugefuegt: '2022-01-01',
        verfgbarkeit: true,
        mindestmenge: 10,
        aktion: false,
        verkaufteAnzahl: 0,
        mehrwehrsteuer: 0.23,

        lieferant: new LieferantDto,
        lagerorte: [],
        bestellungen: [],
        kategorie: [],
        wareneingang: [],
        warenausgang: [],
        promocje: [],
        reservation: [],
        bewertung: [],
        id: 0
      };

      const newP: Produkt = new Produkt();
      Object.assign(newP, productDto);
      newP.id =1;

      jest.spyOn(productRepository, 'create').mockReturnValue(newP);
      jest.spyOn(productRepository, 'save').mockResolvedValue(newP);

      const response = await request(app.getHttpServer())
        .post('/product')
        .send(productDto)
        .expect(201);

      expect(response.body).toMatchObject(newP);
    });

    it('should return 400 if required fields are missing', async () => {
      const productDto: ProductDto = {
        name: 'Test Product',
        beschreibung: 'Test description',
        foto: 'test.jpg',
        thumbnail: 'test_thumbnail.jpg',
        datumHinzugefuegt: '2022-01-01',
        verfgbarkeit: true,
        mindestmenge: 10,
        aktion: false,
        verkaufteAnzahl: 0,
        mehrwehrsteuer: 0.23,
        id: 0,
        preis: 0,
        lieferant: new LieferantDto,
        lagerorte: [],
        bestellungen: [],
        kategorie: [],
        wareneingang: [],
        warenausgang: [],
        promocje: [],
        reservation: [],
        bewertung: []
      };

      await request(app.getHttpServer()).post('/product').send(productDto).expect(400);
    });
  });

  describe('PUT product/:id', () => {
    it('should update a product', async () => {
      const productId = 1;
      const productDto: ProductDto = {
        name: 'Updated Product',
        id: 1,
        preis: 0,
        beschreibung: 'kosa',
        foto: '',
        thumbnail: '',
        lieferant: new LieferantDto,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '',
        kategorie: [],
        verfgbarkeit: false,
        mindestmenge: 0,
        aktion: false,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
        reservation: [],
        bewertung: []
      };
      const updatedProduct: Produkt = new Produkt();
      Object.assign(updatedProduct, productDto);
      updatedProduct.id = 1;
    

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(updatedProduct);
      jest.spyOn(productRepository, 'merge').mockImplementation();
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

      const response = await request(app.getHttpServer())
        .put(`/product/:${productId}`)
        .send(productDto)
        .expect(200);
    
      expect(response.body).toMatchObject(productDto);
    });

    it('should return 404 if product not found', async () => {
      const productId = 999;
      const productDto: ProductDto = {
        name: 'Updated Product',
        id: 0,
        preis: 0,
        beschreibung: '',
        foto: '',
        thumbnail: '',
        lieferant: new LieferantDto,
        lagerorte: [],
        bestellungen: [],
        datumHinzugefuegt: '',
        kategorie: [],
        verfgbarkeit: false,
        mindestmenge: 0,
        aktion: false,
        verkaufteAnzahl: 0,
        wareneingang: [],
        warenausgang: [],
        mehrwehrsteuer: 0,
        promocje: [],
        reservation: [],
        bewertung: []
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await request(app.getHttpServer()).put(`/product/${productId}`).send(productDto).expect(404);
    });
  });

  describe('DELETE /product/:id', () => {
    it('should delete a product', async () => {
      const productId = 1;

      jest.spyOn(productRepository, 'delete').mockResolvedValue({ affected: 1, raw: undefined });

      await request(app.getHttpServer()).delete(`/product/${productId}`).expect(200);
    });

    it('should return 404 if product not found', async () => {
      const productId = 999;

      jest.spyOn(productRepository, 'delete').mockResolvedValue({ affected: 0, raw: undefined });

     const res =  await request(app.getHttpServer()).delete(`/product/${productId}`).expect(200);
     expect(res.body).toEqual({affected: 0})
    });
  });
  describe('POST /product/upload', () => {
    it('should upload a photo', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      };
     jest.spyOn(photoService, 'savePhoto').mockImplementation(() => {
        return file.originalname;
      })

      const response = await request(app.getHttpServer())
        .post('/product/upload')
        .attach('photo', file.buffer, file.originalname)
        .expect(201);
      expect(response.text).toEqual( 'test.jpg' )
    });
    it('should upload a photo png', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
      };
      jest.spyOn(photoService, 'savePhoto').mockReturnValue('test.png')

      const response = await request(app.getHttpServer())
        .post('/product/upload')
        .attach('photo', file.buffer, file.originalname)
        .expect(201);

      expect(response.text).toBe('test.png');
    });

    it('should return 415 if file type is not supported', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.gif',
      };

      await request(app.getHttpServer())
        .post('/product/upload')
        .attach('photo', file.buffer, file.originalname)
        .expect(415);
    });
  });
});