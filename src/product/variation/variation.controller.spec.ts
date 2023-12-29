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

describe('VariationController', () => {
  let controller: VariationController;
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let varRepo: Repository<ProduktVariations>;
  let dataSource: DataSource;

  const vari1: ProduktVariations = {
    sku: 'vari1',
    produkt: new Produkt(),
    variations_name: 'kot',
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
    quanity: 10,
    quanity_sold: 0,
    quanity_sold_at_once: 2,
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
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
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
});
