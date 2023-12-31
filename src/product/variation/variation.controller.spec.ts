import { Test, TestingModule } from '@nestjs/testing';
import { VariationController } from './variation.controller';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { ProduktVariations } from 'src/entity/produktVariations';
import { VariationService } from './variation.service';
import { PhotoService } from 'src/service/photoService';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Produkt } from 'src/entity/produktEntity';
import { ProductVariationDto } from 'src/dto/productVariation.dto';
import { DeleteFileDto } from 'src/dto/deleteFilde.dto';

describe('VariationController', () => {
  let controller: VariationController;
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let varRepo: Repository<ProduktVariations>;
  let dataSource: DataSource;
  let photoService: PhotoService;

  const prod: Produkt = {
    id: 0,
    name: '',
    sku: 'jsagdh23',
    artid: 0,
    beschreibung: '',
    lieferant: undefined,
    lagerorte: [],
    bestellungen: [],
    datumHinzugefuegt: undefined,
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
    produkt_image: 'shjakhdkahjs-jshadahsjgd',
    shipping_costs: [],
  };

  const delFileDto: DeleteFileDto = {
    produktid: 'vari1',
    fileid: 'sajgd-ajsgd',
  };
  const variDto: ProductVariationDto = {
    sku: '',
    produkt: new Produkt(),
    variations_name: 'kot',
    hint: '',
    value: '',
    unit: '',
    image: '',
    price: 4,
    wholesale_price: 0,
    thumbnail: '',
    quanity: 0,
    quanity_sold: 0,
    quanity_sold_at_once: 1,
  };
  const vari1: ProduktVariations = {
    sku: 'vari1',
    produkt: new Produkt(),
    variations_name: 'kot',
    hint: '',
    value: '',
    unit: '',
    image: 'sajgd-ajsgd',
    price: 0,
    wholesale_price: 0,
    thumbnail: '',
    quanity: 10,
    quanity_sold: 0,
    quanity_sold_at_once: 1,
  };

  const vari2: ProduktVariations = {
    sku: 'vari2',
    produkt: new Produkt(),
    variations_name: 'kot',
    hint: '',
    value: '',
    unit: '',
    image: '',
    price: 0,
    wholesale_price: 0,
    thumbnail: '',
    quanity: 0,
    quanity_sold: 0,
    quanity_sold_at_once: 0,
  };

  const vari3: ProduktVariations = {
    sku: 'vari3',
    produkt: new Produkt(),
    variations_name: 'pies',
    hint: '',
    value: '',
    unit: '',
    image: '',
    price: 0,
    wholesale_price: 0,
    thumbnail: '',
    quanity: 10,
    quanity_sold: 0,
    quanity_sold_at_once: 1,
  };

  const varations: ProduktVariations[] = [vari1, vari2, vari3];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariationController],
      providers: [
        VariationService,
        {
          provide: getRepositoryToken(ProduktVariations),
          useClass: Repository,
        },
        PhotoService,
        {
          provide: getDataSourceToken(),
          useValue: {
            getRepository: jest.fn().mockReturnValue({
              // Mock the repository methods as needed
            }),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: true,
      })
      .compile();
    controller = module.get<VariationController>(VariationController);
    varRepo = module.get<Repository<ProduktVariations>>(
      getRepositoryToken(ProduktVariations),
    );
    dataSource = module.get<DataSource>(getDataSourceToken());
    photoService = module.get<PhotoService>(PhotoService);
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
    await jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('should get produkt variations', () => {
    it('it should get all produkt variations', async () => {
      jest.spyOn(varRepo, 'createQueryBuilder').mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValueOnce(varations),
      } as unknown as SelectQueryBuilder<ProduktVariations>);

      const requ = await request(app.getHttpServer())
        .get('/variation')
        .expect(200);
      expect(requ.body).toEqual(varations);
    });
    it('should get produkt varations by name', async () => {
      jest.spyOn(varRepo, 'find').mockImplementationOnce(async ({ where }) => {
        return varations.filter(
          (tmp) => tmp.variations_name === Object(where).variations_name,
        );
      });

      const requ = await request(app.getHttpServer())
        .get('/variation/kot')
        .expect(200);
      expect(requ.body).toEqual(
        varations.filter((tmp) => tmp.variations_name === 'kot'),
      );
    });
    it('should get produkt varation by sku', async () => {
      jest
        .spyOn(varRepo, 'findOne')
        .mockImplementationOnce(async ({ where }) => {
          return varations.find((tmp) => tmp.sku === Object(where).sku);
        });

      const requ = await request(app.getHttpServer())
        .get('/variation/sku/vari2')
        .expect(200);
      expect(requ.body).toEqual(varations.find((tmp) => tmp.sku === 'vari2'));
    });
    it('should throw 404 item not found where sku not found', async () => {
      jest
        .spyOn(varRepo, 'findOne')
        .mockImplementationOnce(async ({ where }) => {
          return varations.find((tmp) => tmp.sku === Object(where).sku);
        });

      const requ = await request(app.getHttpServer())
        .get('/variation/sku/vari2sjd')
        .expect(404);
      expect(requ.body.message).toEqual('Item not found');
    });
  });
  describe(' should create or update produkt variation', () => {
    it('should create new produkt varation', async () => {
      jest
        .spyOn(varRepo, 'create')
        .mockImplementationOnce((entity) => entity as ProduktVariations);
      jest.spyOn(varRepo, 'save').mockResolvedValueOnce(vari1);
      const requ = await request(app.getHttpServer())
        .post('/variation')
        .send(variDto)
        .expect(201);
      expect(requ.body).toEqual(vari1);
    });
    it('should update produkt varation', async () => {
      jest
        .spyOn(varRepo, 'update')
        .mockResolvedValueOnce({ raw: '', affected: 1, generatedMaps: [] });
      const requ = await request(app.getHttpServer())
        .put('/variation/hjasgd223')
        .send(vari1)
        .expect(200);

      expect(requ.body).toEqual({ raw: '', affected: 1, generatedMaps: [] });
    });
  });
  describe('should dalete produkt varation', () => {
    it('should throw error item not found', async () => {
      let sku = '';
      jest.spyOn(varRepo, 'findOne').mockImplementationOnce(({ where }) => {
        sku = Object(where).sku;
        return null;
      });

      const requ = await request(app.getHttpServer())
        .delete('/variation/kjahsd21')
        .expect(404);

      expect(requ.body.message).toBe(`Item with ${sku} not found`);
    });
    it('should throw error if item quantity is not 0', async () => {
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(vari3);

      const requ = await request(app.getHttpServer())
        .delete('/variation/kjahsd21')
        .expect(400);

      expect(requ.body.message).toBe(
        `Item quantitat is bigger then 0, its not popssible to delete it`,
      );
    });
    it('should return deleteResult', async () => {
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(vari2);
      jest
        .spyOn(varRepo, 'delete')
        .mockResolvedValueOnce({ raw: '', affected: 1 });

      const requ = await request(app.getHttpServer())
        .delete('/variation/kjahsd21')
        .expect(200);

      expect(requ.body).toEqual({ raw: '', affected: 1 });
    });
  });
  describe('should save or delete foto', () => {
    it('should upload a photo', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
      };
      jest
        .spyOn(photoService, 'savePhoto')
        .mockResolvedValueOnce({ imageid: 'test.jpeg' });

      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(vari1);
      jest.spyOn(varRepo, 'save').mockImplementationOnce(async (ent) => {
        return ent as ProduktVariations;
      });

      const response = await request(app.getHttpServer())
        .post('/variation/upload/1')
        .attach('photo', file.buffer, file.originalname)
        .expect(201);
      expect(response.body).toEqual({ imageid: 'test.jpeg' });
    });
    it('should upload a photo png', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.png',
      };
      jest
        .spyOn(photoService, 'savePhoto')
        .mockResolvedValueOnce({ imageid: 'test.png' });

      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(vari1);
      jest.spyOn(varRepo, 'save').mockImplementationOnce(async (ent) => {
        return ent as ProduktVariations;
      });
      const response = await request(app.getHttpServer())
        .post('/variation/upload/1')
        .attach('photo', file.buffer, file.originalname)
        .expect(201);

      expect(response.text).toBe(JSON.stringify({ imageid: 'test.png' }));
    });

    it('should return 415 if file type is not supported', async () => {
      const file = {
        buffer: Buffer.from('test'),
        originalname: 'test.gif',
      };

      await request(app.getHttpServer())
        .post('/variation/upload/1')
        .attach('photo', file.buffer, file.originalname)
        .expect(415);
    });
    it('should delete file and thumbnails class produktVarations', async () => {
      const tmpitem: ProduktVariations = {} as ProduktVariations;
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(vari1);
      jest.spyOn(varRepo, 'save').mockImplementationOnce(async (item) => {
        Object.assign(tmpitem, item as ProduktVariations);
        return item as ProduktVariations;
      });

      const requ = await request(app.getHttpServer())
        .post('/variation/file-delete')
        .send(delFileDto)
        .expect(201);
      expect(requ.text).toBe('1');
      expect(tmpitem.image).toBe('');
      expect(tmpitem.sku).toBe(vari1.sku);
    });
    it('should delete file and thumbnails class produkt', async () => {
      const tmpitem: Produkt = {} as Produkt;
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(dataSource, 'getRepository').mockImplementationOnce(() => {
        return {
          findOne: jest.fn().mockImplementationOnce(() => {
            return prod as Produkt;
          }),
        } as unknown as Repository<Produkt>;
      });
      jest.spyOn(dataSource, 'getRepository').mockImplementationOnce(() => {
        return {
          save: jest.fn().mockImplementationOnce((entity) => {
            Object.assign(tmpitem, entity);
            return entity;
          }),
        } as unknown as Repository<Produkt>;
      });

      const requ = await request(app.getHttpServer())
        .post('/variation/file-delete')
        .send(delFileDto)
        .expect(201);
      expect(requ.text).toBe('1');
      expect(tmpitem.produkt_image).toBe('');
      expect(tmpitem.sku).toBe(prod.sku);
    });
  });
  describe('should save on image link in product or varation', () => {
    it('should save link in product Variation', async () => {
      const tmpitem: ProduktVariations = {} as ProduktVariations;
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(vari2);
      jest.spyOn(varRepo, 'save').mockImplementationOnce(async (item) => {
        Object.assign(tmpitem, item as ProduktVariations);
        return item as ProduktVariations;
      });
      const requ = await request(app.getHttpServer())
        .post('/variation/imagelink')
        .send({ link: 'piwo-mielone', id: 'sku' })
        .expect(201);
      expect(requ.body).toEqual({ imageid: 'piwo-mielone' });
      expect(tmpitem.image).toBe('piwo-mielone');
    });
    it('should save link in product Variation', async () => {
      const tmpitem: Produkt = {} as Produkt;
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(dataSource, 'getRepository').mockImplementationOnce(() => {
        return {
          findOne: jest.fn().mockImplementationOnce(() => {
            return prod as Produkt;
          }),
        } as unknown as Repository<Produkt>;
      });
      jest.spyOn(dataSource, 'getRepository').mockImplementationOnce(() => {
        return {
          save: jest.fn().mockImplementationOnce((entity) => {
            Object.assign(tmpitem, entity);
            return entity;
          }),
        } as unknown as Repository<Produkt>;
      });
      const requ = await request(app.getHttpServer())
        .post('/variation/imagelink')
        .send({ link: 'piwo-mielone', id: 'sku' })
        .expect(201);
      expect(requ.body).toEqual({ imageid: 'piwo-mielone' });
      expect(tmpitem.produkt_image).toBe('piwo-mielone');
    });
    it('should throw an error produkt or produkt varation not found', async () => {
      jest.spyOn(varRepo, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(dataSource, 'getRepository').mockImplementationOnce(() => {
        return {
          findOne: jest.fn().mockImplementationOnce(() => {
            return null;
          }),
        } as unknown as Repository<Produkt>;
      });
      const requ = await request(app.getHttpServer())
        .post('/variation/imagelink')
        .send({ link: 'piwo-mielone', id: 'sku' })
        .expect(404);
      expect(requ.body.message).toEqual('Item not found');
    });
  });
});
