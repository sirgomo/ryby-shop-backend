import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductDto } from 'src/dto/product.dto';
import { Produkt } from 'src/entity/produktEntity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Lieferant } from 'src/entity/lifernatEntity';
import { LieferantDto } from 'src/dto/liferant.dto';
import { PhotoService } from 'src/service/photoService';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EanEntity } from 'src/entity/eanEntity';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  // let productService: ProductService;
  let productRepository: Repository<Produkt>;
  //let enaRepo: Repository<EanEntity>;
  //let photoService: PhotoService;
  const prod1: Produkt = {
    id: 12,
    name: 'piwko',
    sku: 'kjas3',
    artid: 11,
    beschreibung: '',
    lieferant: new Lieferant(),
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: '2022-01-01' as unknown as Date,
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
  const prod: Produkt = {
    id: 13,
    name: 'piwko 2',
    sku: 'kjas3',
    artid: 11,
    beschreibung: '',
    lieferant: new Lieferant(),
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: '2022-01-01' as unknown as Date,
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
    name: 'Test Product',
    beschreibung: 'Test description',
    datumHinzugefuegt: '2022-01-01',
    verfgbarkeit: 1,
    mehrwehrsteuer: 0.23,
    id: undefined,
    lieferant: new LieferantDto(),
    lagerorte: [],
    bestellungen: [],
    kategorie: [],
    wareneingang: [],
    promocje: [],
    bewertung: [],
    artid: 0,
    product_sup_id: '',
    sku: '',
    ebay: 0,
    eans: [],
    variations: [],
    produkt_image: '',
    shipping_costs: [],
  };
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
        PhotoService,
        {
          provide: getRepositoryToken(EanEntity),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    // productService = moduleFixture.get<ProductService>(ProductService);
    productRepository = moduleFixture.get<Repository<Produkt>>(
      getRepositoryToken(Produkt),
    );
    //enaRepo = moduleFixture.get<Repository<EanEntity>>(
    //  getRepositoryToken(EanEntity),
    //);
    //photoService = moduleFixture.get<PhotoService>(PhotoService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /product', () => {
    it('should return all products', async () => {
      const mockProducts: Produkt[] = [prod, prod1];

      jest
        .spyOn(productRepository, 'findAndCount')
        .mockResolvedValueOnce([mockProducts, 2]);

      const response = await request(app.getHttpServer())
        .get('/product/null/1/20/1')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);

      expect(response.body[0][0].name).toBe('piwko 2');
      expect(response.body[0][1].name).toBe('piwko');
      expect(response.body[1]).toBe(2);
    });
  });

  describe('GET /product/:id', () => {
    it('should return a product by id', async () => {
      const productId = 12;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(prod);

      const response = await request(app.getHttpServer())
        .get(`/product/${productId}`)
        .expect(200);

      expect(response.body).toMatchObject(prod);
    });

    it('should return 404 if product not found', async () => {
      const productId = -999;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get(`/product/${productId}`)
        .expect(404);
      expect(res.body.message).toBe('Produkt not found');
    });
  });

  describe('POST /product', () => {
    it('should create a new product', async () => {
      jest.spyOn(productRepository, 'create').mockReturnValue(prod);
      jest.spyOn(productRepository, 'save').mockResolvedValue(prod);

      const response = await request(app.getHttpServer())
        .post('/product')
        .send(productDto)
        .expect(201);

      expect(response.body).toMatchObject(prod);
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/product')
        .send(productDto)
        .expect(400);
    });
  });

  describe('PUT product/:id', () => {
    it('should update a product', async () => {
      const productId = 1;

      const updatedProduct: Produkt = new Produkt();
      Object.assign(updatedProduct, productDto);
      updatedProduct.id = 1;
      updatedProduct.beschreibung = 'produkt updated';

      jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValue(updatedProduct);
      jest.spyOn(productRepository, 'merge').mockImplementation();
      jest.spyOn(productRepository, 'save').mockResolvedValue(updatedProduct);

      const response = await request(app.getHttpServer())
        .put(`/product/:${productId}`)
        .send(productDto)
        .expect(200);
      expect(response.body).toMatchObject(updatedProduct);
    });

    it('should return 404 if product not found', async () => {
      const productId = 999;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await request(app.getHttpServer())
        .put(`/product/${productId}`)
        .send(productDto)
        .expect(404);
    });
  });

  describe('DELETE /product/:id', () => {
    it('should delete a product', async () => {
      const productId = 1;
      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(prod);
      jest
        .spyOn(productRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: undefined });

      const res = await request(app.getHttpServer())
        .delete(`/product/${productId}`)
        .expect(200);
      expect(res.body).toEqual({ affected: 1 });
    });

    it('should return affected 0 if product not found', async () => {
      const productId = 999;
      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(prod);
      jest
        .spyOn(productRepository, 'delete')
        .mockResolvedValueOnce({ affected: 0, raw: undefined });

      const res = await request(app.getHttpServer())
        .delete(`/product/${productId}`)
        .expect(200);
      console.log(res.body);
      expect(res.body).toEqual({ affected: 0 });
    });
  });
});
