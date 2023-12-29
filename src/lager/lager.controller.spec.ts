import { Test, TestingModule } from '@nestjs/testing';
import { LagerController } from './lager.controller';
import { Repository } from 'typeorm';
import { Lager } from 'src/entity/lagerEntity';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { LagerService } from './lager.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';

describe('LagerController', () => {
  let controller: LagerController;
  let lagerRepo: Repository<Lager>;
  let app: INestApplication;
  let lagers: Lager[] = [];

  beforeEach(async () => {
    const lager1: Lager = {
      id: 1,
      name: 'abc',
      lagerorte: [],
      adresse: 'abc',
      wareneingang: undefined,
    };
    const lager2: Lager = {
      id: 2,
      name: 'abcd',
      lagerorte: [],
      adresse: 'abcd',
      wareneingang: undefined,
    };
    lagers = [lager1, lager2];
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LagerController],
      providers: [
        LagerService,
        {
          provide: getRepositoryToken(Lager),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();
    lagerRepo = module.get<Repository<Lager>>(getRepositoryToken(Lager));
    controller = module.get<LagerController>(LagerController);
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('default test', () => {
    it('should return all warehaouses', async () => {
      jest.spyOn(lagerRepo, 'find').mockResolvedValueOnce(lagers);

      const requ = await request(app.getHttpServer()).get('/lager').expect(200);

      expect(requ.body).toEqual(lagers);
    });
    it('it should return on warehouse with id 1', async () => {
      jest.spyOn(lagerRepo, 'findOne').mockResolvedValueOnce(lagers[1]);
      const requ = await request(app.getHttpServer())
        .get('/lager/1')
        .expect(200);

      expect(requ.body).toEqual(lagers[1]);
    });
    it('it should create new warehaouse with id 2', async () => {
      const newItem: Lager = {
        id: undefined,
        name: 'aco aco',
        lagerorte: [],
        adresse: 'joki poki',
        wareneingang: undefined,
      };
      jest.spyOn(lagerRepo, 'create').mockReturnThis();
      jest
        .spyOn(lagerRepo, 'save')
        .mockResolvedValueOnce({ ...newItem, id: 3 });
      const requ = await request(app.getHttpServer())
        .post('/lager')
        .send(newItem)
        .expect(201);

      expect(requ.body).toEqual({ ...newItem, id: 3 });
    });
    it('it should update warehuse', async () => {
      const newItem: Lager = {
        id: 2,
        name: 'aco aco',
        lagerorte: [],
        wareneingang: undefined,
        adresse: undefined,
      };
      jest.spyOn(lagerRepo, 'create').mockResolvedValueOnce(newItem as never);
      jest.spyOn(lagerRepo, 'findOne').mockResolvedValueOnce(lagers[2]);
      jest.spyOn(lagerRepo, 'merge').mockImplementation((entity, dto) => ({
        ...(dto as Lager),
        ...(entity as Lager),
      }));
      jest.spyOn(lagerRepo, 'save').mockImplementationOnce(async (entity) => {
        // Tutaj zakładamy, że `entity` jest wynikiem z `merge`
        return entity as Lager;
      });
      const requ = await request(app.getHttpServer())
        .put('/lager')
        .send(newItem)
        .expect(200);
      expect(requ.body).toEqual({ ...newItem, ...lagers[2] });
    });
    it('should delete  warehaouse with id 1', async () => {
      jest
        .spyOn(lagerRepo, 'delete')
        .mockResolvedValueOnce({ raw: '', affected: 1 });
      const requ = await request(app.getHttpServer())
        .delete('/lager/1')
        .expect(200);

      expect(requ.body).toEqual({ raw: '', affected: 1 });
    });
  });
});
