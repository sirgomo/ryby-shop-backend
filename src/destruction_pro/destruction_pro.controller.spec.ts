import { Test, TestingModule } from '@nestjs/testing';
import { DestructionProController } from './destruction_pro.controller';
import { Destruction_protocolEntity } from 'src/entity/destruction_protocolEntity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import request from 'supertest';
import { DestructionProService } from './destruction_pro.service';
import { INestApplication } from '@nestjs/common';
import { Destruction_Protocol_Status, Destruction_Protocol_Type } from 'src/dto/destruction_protocol.dto';

const item: Destruction_protocolEntity = {
  id: 1,
  produktId: 1,
  variationId: 'sjd72',
  produkt_name: 'jkasjhasd',
  quantity: 3,
  type: Destruction_Protocol_Type.Gestohlen.toString(),
  destruction_date: undefined,
  responsible_person: 'sadasd',
  status: Destruction_Protocol_Status.CLOSED.toString(),
  description: ''
};
const item2: Destruction_protocolEntity = {
  id: 2,
  produktId: 2,
  variationId: 'asjd72',
  produkt_name: 'dd jkasjhasd',
  quantity: 5,
  type: Destruction_Protocol_Type.Gestohlen.toString(),
  destruction_date: undefined,
  responsible_person: 'sadasd',
  status: Destruction_Protocol_Status.CLOSED.toString(),
  description: ''
};
const items: Destruction_protocolEntity[] = [item, item2];

describe('DestructionProController', () => {
  let controller: DestructionProController;
  let protocolRepo: Repository<Destruction_protocolEntity>;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DestructionProController],
      providers: [
        DestructionProService,
        {
          provide: getRepositoryToken(Destruction_protocolEntity),
          useValue: {
            manager: {
              transaction: jest.fn()
            },
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            merge: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          }
        }
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: true})
    .compile();
    app = module.createNestApplication();
    protocolRepo = module.get<Repository<Destruction_protocolEntity>>(getRepositoryToken(Destruction_protocolEntity));
    controller = module.get<DestructionProController>(DestructionProController);
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(protocolRepo).toBeDefined();
    expect(app).toBeDefined();
  });
  describe('/GET destruction-pro', () => {
    it('should return an array of protocols', async () => {

      jest.spyOn(protocolRepo, 'findAndCount').mockImplementation(async () => [items, items.length]);

      const res = await request(app.getHttpServer())
        .get('/destruction-pro?page=1&limit=11')
        .expect(200);

        expect(res.body).toEqual([[item, item2], 2])
    });
  });
  /*
  describe('/GET destruction-pro/:id', () => {
    it('should return a single protocol', async () => {
      const result = { id: 1 };
      jest.spyOn(destructionProService, 'getProtocolById').mockImplementation(async () => result);

      return request(app.getHttpServer())
        .get('/destruction-pro/1')
        .expect(200)
        .expect(result);
    });
  });

  describe('/POST destruction-pro', () => {
    it('should create a new protocol', async () => {
      const newProtocol = { name: 'Test Protocol' };
      const result = { id: 1, ...newProtocol };
      jest.spyOn(destructionProService, 'createProtocol').mockImplementation(async () => result);

      return request(app.getHttpServer())
        .post('/destruction-pro')
        .send(newProtocol)
        .expect(201)
        .expect(result);
    });
  });

  describe('/DELETE destruction-pro/:id', () => {
    it('should delete a protocol', async () => {
      jest.spyOn(destructionProService, 'deleteProtocolById').mockImplementation(async () => ({ deleted: true }));

      return request(app.getHttpServer())
        .delete('/destruction-pro/1')
        .expect(200)
        .expect({ deleted: true });
    });
  });

  describe('/PUT destruction-pro/:id', () => {
    it('should update a protocol', async () => {
      const updatedProtocol = { name: ' Protocol' };
      const result = { id: 1, ...updatedProtocol };
      jest.spyOn(destructionProService, 'editProtocol').mockImplementation(async () => result);

      return request(app.getHttpServer())
        .put('/destruction-pro/1')
        .send(updatedProtocol)
        .expect(200)
        .expect(result);
    });
  });
  */
  afterAll(async () => {
    await app.close();
  });

});
