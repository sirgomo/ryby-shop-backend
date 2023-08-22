import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { WarenEingangBuchenService } from '../waren-eingang-buchen/waren-eingang-buchen.service';
import { WarenEingangBuchenController } from '../waren-eingang-buchen/waren-eingang-buchen.controller';
import { WarenEingangDto } from '../dto/warenEingang.dto';
import { WarenEingangProductDto } from '../dto/warenEingangProduct.dto';
import { Wareneingang } from '../entity/warenEingangEntity';
import { WareneingangProduct } from '../entity/warenEingangProductEntity';
import { Lieferant } from 'src/entity/lifernatEntity';
import { Produkt } from 'src/entity/produktEntity';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

describe('WarenEingangBuchenController (e2e)', () => {
  let app: INestApplication;
  let warenEingangRepository: Repository<Wareneingang>;
  let warenEingangProductRepository: Repository<WareneingangProduct>;
  let prod: Repository<Produkt>;
  const request = require('supertest');
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WarenEingangBuchenController],
      providers: [
        WarenEingangBuchenService,
        {
          provide: getRepositoryToken(Wareneingang),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WareneingangProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
      ],
    }).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true}).compile();

    app = moduleFixture.createNestApplication();
    warenEingangRepository = moduleFixture.get<Repository<Wareneingang>>(
      getRepositoryToken(Wareneingang),
    );
    warenEingangProductRepository = moduleFixture.get<Repository<WareneingangProduct>>(
      getRepositoryToken(WareneingangProduct),
    );
    prod = moduleFixture.get<Repository<Produkt>>(getRepositoryToken(Produkt));
    await app.init();


  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /waren-eingang-buchen', () => {
    it('should return all warenEingang entries', async () => {
      const warenEingang: Wareneingang[] = [
        {
          id: 1,
          products: [],
          lieferant: {} as Lieferant,
          empfangsdatum: new Date(),
          rechnung: '12345',
          lieferscheinNr: '67890',
          datenEingabe: new Date(),
          gebucht: false,
          eingelagert: false,
        },
        {
          id: 2,
          products: [],
          lieferant: {} as Lieferant,
          empfangsdatum: new Date(),
          rechnung: '54321',
          lieferscheinNr: '09876',
          datenEingabe: new Date(),
          gebucht: false,
          eingelagert: false,
        },
      ];

      jest.spyOn(warenEingangRepository, 'find').mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer()).get('/waren-eingang-buchen');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(warenEingang);
    });
  });

  describe('GET /waren-eingang-buchen/:id', () => {
    it('should return the specified warenEingang entry', async () => {
      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer()).get('/waren-eingang-buchen/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(warenEingang);
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer()).get('/waren-eingang-buchen/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Wareneingang nicht gefunden' });
    });
  });

  describe('POST /waren-eingang-buchen', () => {
    it('should create a new warenEingang entry', async () => {
      const warenEingangDto: WarenEingangDto = {
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
        id: null,
      };
      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: undefined,
        gebucht: false,
        eingelagert: false
      };
      jest.spyOn(warenEingangRepository, 'create').mockReturnValueOnce(warenEingang);
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(warenEingangDto);
    });
  });

  describe('PUT /waren-eingang-buchen', () => {
    it('should update a warenEingang entry', async () => {
      const warenEingangDto: WarenEingangDto = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '123456',
        lieferscheinNr: '678906',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };
      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: undefined,
        gebucht: false,
        eingelagert: false
      };
      const warenEingang1: Wareneingang = {
        id: 1,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '123456',
        lieferscheinNr: '678906',
        datenEingabe: undefined,
        gebucht: false,
        eingelagert: false
      };
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangRepository, 'merge').mockReturnValueOnce(warenEingang);
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValueOnce(warenEingang1);

      const response = await request(app.getHttpServer())
        .put('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(warenEingangDto);
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      const warenEingangDto: WarenEingangDto = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .put('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Wareneingang nicht gefunden' });
    });

    it('should return 400 if the warenEingang entry is already booked', async () => {
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
      };
      const warenEingang1: Wareneingang = {
        id: 1,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '123456',
        lieferscheinNr: '678906',
        datenEingabe: undefined,
        gebucht: false,
        eingelagert: false
      };
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang1);

      const response = await request(app.getHttpServer())
        .put('/waren-eingang-buchen')
        .send(warenEingangDto);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Bereits gebuchter Wareneingang kann nicht aktualisiert werden' });
    });
  });

  describe('DELETE /wareningang-buchen/:id', () => {
    it('should delete a warenEingang entry', async () => {
    const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant ,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangRepository, 'delete').mockResolvedValueOnce({ affected: 1 } as DeleteResult);

      const response = await request(app.getHttpServer()).delete('/waren-eingang-buchen/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ affected: 1 });
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer()).delete('/waren-eingang-buchen/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Wareneingang nicht gefunden' });
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
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer()).delete('/waren-eingang-buchen/1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Bereits gebuchter Wareneingang kann nicht gelöscht werden' });
    });
  });

  describe('POST /waren-eingang-buchen/:wareneingangId/products', () => {
    it('should add a product to the specified warenEingang entry', async () => {
      const productDto: WarenEingangProductDto = {
        id: 1,
        wareneingang: {} as Wareneingang as Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };
      const prod: WareneingangProduct = {
        id: null,
        wareneingang: new Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };
      const prod1: WareneingangProduct = {
        id: 1,
        wareneingang: new Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangProductRepository, 'create').mockReturnValueOnce(prod);
      jest.spyOn(warenEingangProductRepository, 'save').mockResolvedValueOnce(prod1);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen/1/products')
        .send(productDto);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(productDto);
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      const productDto: WarenEingangProductDto = {
        id: 1,
        wareneingang: {} as Wareneingang as Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen/1/products')
        .send(productDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Wareneingang nicht gefunden' });
    });

    it('should return 400 if the warenEingang entry is already booked', async () => {
      const productDto: WarenEingangProductDto = {
        id: 1,
        wareneingang: {} as Wareneingang as Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

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
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer())
        .post('/waren-eingang-buchen/1/products')
        .send(productDto);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Produkt kann nicht zu einem bereits gebuchten Wareneingang hinzugefügt werden' });
    });
  });

  describe('PATCH /waren-eingang-buchen/:wareneingangId/products/:productId', () => {
    it('should update the specified product in the specified warenEingang entry', async () => {
      const productDto: WarenEingangProductDto = {
        id: 1,
        wareneingang: {} as Wareneingang as Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

      const warenEingang: Wareneingang = {
        id: 1,
        products: [
          {
            id: 1,
            wareneingang: {} as Wareneingang as Wareneingang,
            produkt: [],
            menge: 5,
            preis: 50,
            mwst: 10,
            mengeEingelagert: 0,
            color: 'Blue',
          },
          {
            id: 2,
            wareneingang: {} as Wareneingang as Wareneingang,
            produkt: [],
            menge: 3,
            preis: 30,
            mwst: 5,
            mengeEingelagert: 0,
            color: 'Green',
          },
        ],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };
      const merged: WareneingangProduct = {
        id: 1,
        wareneingang: new Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangProductRepository, 'findOne').mockResolvedValueOnce(warenEingang.products[0]);
      jest.spyOn(warenEingangProductRepository, 'merge').mockReturnValueOnce(merged);
      jest.spyOn(warenEingangProductRepository, 'save').mockResolvedValueOnce(merged);

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
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .patch('/waren-eingang-buchen/1/products/1')
        .send(productDto);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Wareneingang nicht gefunden' });
    });

    it('should return 404 if the product is not found', async () => {
      const productDto: WarenEingangProductDto = {
        id: 1,
        wareneingang: {} as Wareneingang,
        produkt: [],
        menge: 10,
        preis: 100,
        mwst: 20,
        mengeEingelagert: 0,
        color: 'Red',
      };

      const warenEingang: Wareneingang = {
        id: 1,
        products: [],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangProductRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer())
        .patch('/waren-eingang-buchen/1/products/1')
        .send(productDto);

 expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Produkt nicht gefunden' });
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
            produkt: [],
            menge: 5,
            preis: 50,
            mwst: 10,
            mengeEingelagert: 0,
            color: 'Blue',
          },
          {
            id: 2,
            wareneingang: {} as Wareneingang,
            produkt: [],
            menge: 3,
            preis: 30,
            mwst: 5,
            mengeEingelagert: 0,
            color: 'Green',
          },
        ],
        lieferant: {} as Lieferant,
        empfangsdatum: new Date(),
        rechnung: '12345',
        lieferscheinNr: '67890',
        datenEingabe: new Date(),
        gebucht: false,
        eingelagert: false,
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);
      jest.spyOn(warenEingangProductRepository, 'delete').mockResolvedValueOnce({ affected: 1 } as DeleteResult);

      const response = await request(app.getHttpServer()).delete('/waren-eingang-buchen/1/products/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ affected: 1 });
    });

    it('should return 404 if the warenEingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer()).delete('/waren-eingang-buchen/1/products/1');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ "error": "Not Found", "message": "Wareneingang nicht gefunden", "statusCode": 404 });
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
      };

      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValueOnce(warenEingang);

      const response = await request(app.getHttpServer()).delete('/waren-eingang-buchen/1/products/1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Produkt kann nicht aus einem bereits gebuchten Wareneingang gelöscht werden', "statusCode": 400 });
    });
  });
});