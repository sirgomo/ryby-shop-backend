import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WarenEingangBuchenService } from '../waren-eingang-buchen/waren-eingang-buchen.service';
import { WarenEingangBuchenController } from '../waren-eingang-buchen/waren-eingang-buchen.controller';
import { WarenEingangDto } from '../dto/warenEingang.dto';
import { WarenEingangProductDto } from '../dto/warenEingangProduct.dto';
import { Wareneingang } from '../entity/warenEingangEntity';
import { WareneingangProduct } from '../entity/warenEingangProductEntity';
import { Lieferant } from 'src/entity/lifernatEntity';
import { Produkt } from 'src/entity/produktEntity';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import request from 'supertest';
import { WareneingangProdVartiaion } from 'src/entity/waren_eingang_prod_variation';
import { ProductDto } from 'src/dto/product.dto';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

describe('WarenEingangBuchenController (e2e)', () => {
  let app: INestApplication;
  let warenEingangRepository: Repository<Wareneingang>;
  let warenEingangProductRepository: Repository<WareneingangProduct>;
  let wareneingangProdVartiaion: Repository<WareneingangProdVartiaion>;
  let logRepo: Repository<LogsEntity>;
  // let prod: Repository<Produkt>;
  const productDto: ProductDto = {
    id: 2,
    name: 'kjdhakdh',
    sku: 'akjdhjkahsd',
    artid: 0,
    beschreibung: '',
    lieferant: undefined,
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: '',
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
  const warenEingangDto: WarenEingangDto = {
    id: 1,
    products: [],
    lieferant: {} as Lieferant,
    empfangsdatum: new Date(),
    rechnung: '12345',
    lieferscheinNr: '67890',
    datenEingabe: new Date(),
    gebucht: true,
    eingelagert: false,
    shipping_cost: 0,
    remarks: '',
    other_cost: 0,
    location: undefined,
    wahrung: '',
    wahrung2: '',
    wahrung_rate: 0,
    shipping_cost_eur: 0,
    other_cost_eur: 0,
  };
  const wEinProdVart: WareneingangProdVartiaion = {
    id: 3,
    sku: 'jasgdhjasgd',
    quanity: 2,
    price: 2.49,
    price_in_euro: 2.49,
    mwst: 0,
    quanity_stored: 10,
    quanity_sold_at_once: 0,
    waren_eingang_product: undefined,
  };

  const wEinProdVart2: WareneingangProdVartiaion = {
    id: 0,
    sku: 'jasgdhjasgd2dasd',
    quanity: 2,
    price: 2.49,
    price_in_euro: 2.49,
    mwst: 0,
    quanity_stored: 10,
    quanity_sold_at_once: 0,
    waren_eingang_product: undefined,
  };

  const weingProd: WareneingangProduct = {
    id: 2,
    wareneingang: undefined,
    produkt: [],
    product_variation: [wEinProdVart],
  };
  const weingProd2: WareneingangProduct = {
    id: 0,
    wareneingang: undefined,
    produkt: [],
    product_variation: [wEinProdVart2],
  };
  const weing1: Wareneingang = {
    id: 1,
    products: [weingProd],
    lieferant: undefined,
    empfangsdatum: undefined,
    rechnung: '',
    lieferscheinNr: '',
    datenEingabe: undefined,
    gebucht: false,
    eingelagert: false,
    shipping_cost: 0,
    remarks: '',
    other_cost: 0,
    location: undefined,
    wahrung: '',
    wahrung2: '',
    wahrung_rate: 0,
    shipping_cost_eur: 0,
    other_cost_eur: 0,
  };
  const weing2: Wareneingang = {
    id: 0,
    products: [weingProd2],
    lieferant: undefined,
    empfangsdatum: undefined,
    rechnung: '',
    lieferscheinNr: '',
    datenEingabe: undefined,
    gebucht: false,
    eingelagert: false,
    shipping_cost: 0,
    remarks: '',
    other_cost: 0,
    location: undefined,
    wahrung: '',
    wahrung2: '',
    wahrung_rate: 0,
    shipping_cost_eur: 0,
    other_cost_eur: 0,
  };
  beforeEach(async () => {
    weing1.gebucht = false;
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WarenEingangBuchenController],
      providers: [
        WarenEingangBuchenService,
        LogsService,
        {
          provide: getRepositoryToken(Wareneingang),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WareneingangProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WareneingangProdVartiaion),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(LogsEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    warenEingangRepository = moduleFixture.get<Repository<Wareneingang>>(
      getRepositoryToken(Wareneingang),
    );
    logRepo = moduleFixture.get<Repository<LogsEntity>>(
      getRepositoryToken(LogsEntity),
    );
    wareneingangProdVartiaion = moduleFixture.get<
      Repository<WareneingangProdVartiaion>
    >(getRepositoryToken(WareneingangProdVartiaion));
    warenEingangProductRepository = moduleFixture.get<
      Repository<WareneingangProduct>
    >(getRepositoryToken(WareneingangProduct));
    // prod = moduleFixture.get<Repository<Produkt>>(getRepositoryToken(Produkt));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /waren-eingang-buchen', () => {
    it('should return all warenEingang entries', async () => {
      const warenEingang: Wareneingang[] = [weing1, weing2];

      const queryBuilder: any = {
        leftJoinAndSelect: () => queryBuilder,
        getMany: () => warenEingang,
      };

      jest
        .spyOn(warenEingangRepository, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      const response = await request(app.getHttpServer()).get(
        '/waren-eingang-buchen',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(warenEingang);
    });
  });

  describe('GET /waren-eingang-buchen/:id', () => {
    it('should return the specified warenEingang entry', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);

      const response = await request(app.getHttpServer()).get(
        '/waren-eingang-buchen/1',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(weing1);
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer()).get(
        '/waren-eingang-buchen/1',
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Wareneingang nicht gefunden',
        statusCode: 404,
        error: 'Not Found',
      });
    });
  });

  describe('POST /waren-eingang-buchen', () => {
    it('should create a new warenEingang entry', async () => {
      const warenEingangDto: WarenEingangDto = {
        id: 0,
        products: [],
        lieferant: undefined,
        empfangsdatum: undefined,
        rechnung: '',
        lieferscheinNr: '',
        datenEingabe: undefined,
        gebucht: false,
        eingelagert: false,
        shipping_cost: 0,
        remarks: '',
        other_cost: 0,
        location: undefined,
        wahrung: '',
        wahrung2: '',
        wahrung_rate: 0,
        shipping_cost_eur: 0,
        other_cost_eur: 0,
      };

      jest
        .spyOn(warenEingangRepository, 'create')
        .mockImplementationOnce((ent) => ent as Wareneingang);
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValueOnce(weing1);
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(weing1);
    });
  });

  describe('PUT /waren-eingang-buchen', () => {
    it('should update a warenEingang entry', async () => {
      const warenEingangDto: WarenEingangDto = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: undefined,
        rechnung: '12345',
        lieferscheinNr: '678906',
        datenEingabe: undefined,
        gebucht: false,
        eingelagert: false,
        shipping_cost: 0,
        remarks: '',
        other_cost: 0,
        location: undefined,
        wahrung: '',
        wahrung2: '',
        wahrung_rate: 0,
        shipping_cost_eur: 0,
        other_cost_eur: 0,
      };
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);
      jest
        .spyOn(warenEingangRepository, 'merge')
        .mockImplementationOnce((ent, dto) => {
          return {
            ...dto,
            ...ent,
          };
        });
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValueOnce({
        ...warenEingangDto,
        ...weing1,
      });

      const response = await request(app.getHttpServer())
        .put('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...warenEingangDto,
        ...weing1,
      });
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .put('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Wareneingang nicht gefunden',
        statusCode: 404,
        error: 'Not Found',
      });
    });

    it('should return 400 if the warenEingang entry is already booked', async () => {
      weing1.gebucht = true;
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);

      const response = await request(app.getHttpServer())
        .put('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          'Bereits gebuchter Wareneingang kann nicht aktualisiert werden',
        statusCode: 400,
      });
    });
  });

  describe('DELETE /wareningang-buchen/:id', () => {
    it('should delete a warenEingang entry', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);
      jest
        .spyOn(warenEingangRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1 } as DeleteResult);

      const response = await request(app.getHttpServer()).delete(
        '/waren-eingang-buchen/1',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ affected: 1 });
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer()).delete(
        '/waren-eingang-buchen/1',
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Wareneingang nicht gefunden',
        statusCode: 404,
        error: 'Not Found',
      });
    });

    it('should return 400 if the warenEingang entry is already booked', async () => {
      weing1.gebucht = true;
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);

      const response = await request(app.getHttpServer()).delete(
        '/waren-eingang-buchen/1',
      );
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Bereits gebuchter Wareneingang kann nicht gelöscht werden',
      });
    });
  });

  describe('POST /waren-eingang-buchen/:wareneingangId/products', () => {
    it('should add a product to the specified warenEingang entry', async () => {
      const prod: WareneingangProduct = {
        id: 3,
        wareneingang: undefined,
        produkt: [],
        product_variation: [],
      };
      const dto: WarenEingangProductDto = {
        id: 3,
        wareneingang: { id: 1 } as Wareneingang,
        produkt: [],
        product_variation: [],
      };

      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);
      jest
        .spyOn(warenEingangProductRepository, 'create')
        .mockReturnValueOnce(prod);
      jest
        .spyOn(warenEingangProductRepository, 'save')
        .mockResolvedValueOnce(prod);
      jest
        .spyOn(warenEingangRepository, 'save')
        .mockImplementationOnce(async (ent) => {
          return ent as Wareneingang;
        });
      jest
        .spyOn(wareneingangProdVartiaion, 'create')
        .mockImplementationOnce((ent) => ent as WareneingangProdVartiaion);
      jest
        .spyOn(wareneingangProdVartiaion, 'save')
        .mockImplementationOnce(async (ent) => {
          return ent as WareneingangProdVartiaion;
        });
      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen/1/products')
        .send(dto);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(prod);
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen/1/products')
        .send(productDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: 'Wareneingang nicht gefunden',
        error: 'Not Found',
        statusCode: 404,
      });
    });

    it('should return 400 if the warenEingang entry is already booked', async () => {
      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: true,
        eingelagert: false,
        shipping_cost: 0,
        remarks: '',
        other_cost: 0,
        location: undefined,
        wahrung: '',
        wahrung2: '',
        wahrung_rate: 0,
        shipping_cost_eur: 0,
        other_cost_eur: 0,
      };

      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen/1/products')
        .send(productDto);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          'Produkt kann nicht zu einem bereits gebuchten Wareneingang hinzugefügt werden',
        statusCode: 400,
      });
    });
  });

  describe('PATCH /waren-eingang-buchen/:wareneingangId/products/:productId', () => {
    it('should update the specified product in the specified warenEingang entry', async () => {
      weing1.products[0].product_variation = undefined;
      weing1.products[0].produkt = undefined;
      weing1.products[0].wareneingang = undefined;
      productDto.lieferant = undefined;
      productDto.wareneingang = undefined;
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);
      jest
        .spyOn(warenEingangProductRepository, 'findOne')
        .mockResolvedValueOnce(weing1.products[0]);
      jest
        .spyOn(warenEingangProductRepository, 'merge')
        .mockImplementationOnce((entity, dto) => ({ ...dto, ...entity }));
      jest
        .spyOn(warenEingangProductRepository, 'save')
        .mockImplementationOnce(async (ent) => ent as WareneingangProduct);

      const response = await request(app.getHttpServer())
        .patch('/waren-eingang-buchen/1/products/1')
        .send(productDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(productDto);
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      const productDto: WarenEingangProductDto = {
        id: 1,
        wareneingang: {} as Wareneingang,
        produkt: null,
        product_variation: null,
      };

      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .patch('/waren-eingang-buchen/1/products/1')
        .send(productDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Wareneingang nicht gefunden',
        statusCode: 404,
      });
    });

    it('should return 404 if the product is not found', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(weing1);
      jest
        .spyOn(warenEingangProductRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .patch('/waren-eingang-buchen/1/products/1')
        .send(productDto);

      expect(response.status).toBe(404);
      expect(response.body).toStrictEqual({
        error: 'Not Found',
        message: 'Produkt nicht gefunden',
        statusCode: 404,
      });
    });
  });

  describe('DELETE /waren-eingang-buchen/:wareneingangId/products/:productId', () => {
    it('should delete the specified product from the specified warenEingang entry', async () => {
      const warenEingang: Wareneingang = {
        id: 1,
        products: [
          {
            id: 1,
            wareneingang: {} as Wareneingang,
            produkt: null,
            product_variation: null,
          },
          {
            id: 2,
            wareneingang: {} as Wareneingang,
            produkt: null,
            product_variation: null,
          },
        ],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
        shipping_cost: 0,
        remarks: '',
        other_cost: 0,
        location: undefined,
        wahrung: '',
        wahrung2: '',
        wahrung_rate: 0,
        shipping_cost_eur: 0,
        other_cost_eur: 0,
      };
      const saved: Wareneingang = {
        id: 1,
        products: [
          {
            id: 2,
            wareneingang: {} as Wareneingang,
            produkt: null,
            product_variation: null,
          },
        ],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
        shipping_cost: 0,
        remarks: '',
        other_cost: 0,
        location: undefined,
        wahrung: '',
        wahrung2: '',
        wahrung_rate: 0,
        shipping_cost_eur: 0,
        other_cost_eur: 0,
      };
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangRepository, 'save').mockImplementation();
      jest
        .spyOn(warenEingangProductRepository, 'delete')
        .mockResolvedValueOnce({ affected: 1, raw: '' } as DeleteResult);

      const response = await request(app.getHttpServer()).delete(
        '/waren-eingang-buchen/1/products/1',
      );

      expect(response.status).toBe(200);
      expect(warenEingang).toStrictEqual(saved);
      expect(response.body).toStrictEqual({ affected: 1, raw: '' });
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer()).delete(
        '/waren-eingang-buchen/1/products/1',
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Wareneingang nicht gefunden',
        statusCode: 404,
      });
    });

    it('should return 400 if the warenEingang entry is already booked', async () => {
      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: true,
        eingelagert: false,
        shipping_cost: 0,
        remarks: '',
        other_cost: 0,
        location: undefined,
        wahrung: '',
        wahrung2: '',
        wahrung_rate: 0,
        shipping_cost_eur: 0,
        other_cost_eur: 0,
      };

      jest
        .spyOn(warenEingangRepository, 'findOne')
        .mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer()).delete(
        '/waren-eingang-buchen/1/products/1',
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message:
          'Produkt kann nicht aus einem bereits gebuchten Wareneingang gelöscht werden',
        statusCode: 400,
      });
    });
  });
});
