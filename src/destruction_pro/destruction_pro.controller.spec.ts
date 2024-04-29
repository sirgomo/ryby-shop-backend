import { Test, TestingModule } from '@nestjs/testing';
import { DestructionProController } from './destruction_pro.controller';
import { Destruction_protocolEntity } from 'src/entity/destruction_protocolEntity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import request from 'supertest';
import { DestructionProService } from './destruction_pro.service';
import { INestApplication } from '@nestjs/common';
import { Destruction_Protocol_Status, Destruction_Protocol_Type, Destruction_protocolDTO } from 'src/dto/destruction_protocol.dto';
import { ProduktVariations } from 'src/entity/produktVariations';
import { Produkt } from 'src/entity/produktEntity';

const item: Destruction_protocolEntity = {
  id: 1,
  produktId: 1,
  variationId: 'sjd72',
  produkt_name: 'jkasjhasd',
  quantity: 3,
  type: Destruction_Protocol_Type['Beschädigt im Transport'],
  destruction_date: undefined,
  responsible_person: 'sadasd',
  status: Destruction_Protocol_Status.CLOSED,
  description: ''
};
const item2: Destruction_protocolEntity = {
  id: 2,
  produktId: 2,
  variationId: 'asjd72',
  produkt_name: 'dd jkasjhasd',
  quantity: 5,
  type: Destruction_Protocol_Type.Gestohlen,
  destruction_date: undefined,
  responsible_person: 'sadasd',
  status: Destruction_Protocol_Status.CLOSED,
  description: ''
};

const prod: ProduktVariations = {
  sku: 'saddasd',
  produkt: new Produkt(),
  variations_name: 'name',
  hint: '',
  value: '2',
  unit: '2',
  image: '',
  price: 2.97,
  wholesale_price: 2.33,
  thumbnail: '',
  quanity: 10,
  quanity_sold: 1,
  quanity_sold_at_once: 1
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
  
  describe('/GET destruction-pro/:id', () => {
    it('should return a single protocol', async () => {
      const result = { id: 1 };
      jest.spyOn(protocolRepo, 'findOne').mockImplementation(async () => item);

      const res = await request(app.getHttpServer())
        .get('/destruction-pro/1')
        .expect(200)
        
        expect(res.body).toEqual(item);
    });
  });
  
  describe('/POST destruction-pro', () => {
    it('should create a new protocol', async () => {
      const newProtocol = {  
      produktId: 1,
      variationId: 'sjd72',
      produkt_name: 'jkasjhasd',
      quantity: 3,
      type: Destruction_Protocol_Type['Beschädigt im Transport'],
      destruction_date: new Date(Date.now()),
      responsible_person: 'sadasd',
      status: Destruction_Protocol_Status.CLOSED,
      description: null
    }
      const result = { id: null, ...newProtocol };
      jest.spyOn(protocolRepo, 'create').mockImplementation(() => result);
      jest.spyOn(protocolRepo.manager, 'transaction')
        .mockImplementation(async (isoLevel: any, runIn: any) => {
          const transaction = {
            findOne: jest.fn().mockResolvedValue(prod),
            save: jest.fn().mockImplementation((data) => {
              return data.sku ? prod : item 
            })
          };
          if(isoLevel)
            return await isoLevel(transaction);

          return await runIn(transaction);
        })

      const res = await request(app.getHttpServer())
        .post('/destruction-pro')
        .send(newProtocol)
        .expect(201);
        
        expect(res.body).toEqual(item);
        expect(prod.quanity).toEqual(7);
    });
  });

  describe('/DELETE destruction-pro/:id', () => {
    it('should delete a protocol', async () => {
      jest.spyOn(protocolRepo.manager, 'transaction')
        .mockImplementation(async (isoLevel: any, runIn: any) => {
          const transaction = {
            findOne: jest.fn().mockImplementation((data) => {
              return data.sku ? prod: item
            }),
            save: jest.fn().mockReturnValue(prod),
            delete: jest.fn().mockResolvedValue({affected: 1, raw : ''} )
          };
          if(isoLevel)
              return await isoLevel(transaction);

          return await runIn(transaction);
        })

      const requ = await request(app.getHttpServer())
        .delete('/destruction-pro/1')
        .expect(200);
      expect(requ.body).toEqual({ affected: 1, raw : ''});
    });
  });

  describe('/PUT destruction-pro/:id', () => {
    it('should update a protocol', async () => {
      const updatedProtocol: Destruction_protocolDTO = {
        id: 12,
        produktId: 22,
        variationId: 'ksjd8',
        produkt_name: 'dd jkasjhasd',
        quantity: 5,
        type: Destruction_Protocol_Type.Gestohlen,
        destruction_date: new Date(Date.now()),
        responsible_person: 'sadasd',
        status: Destruction_Protocol_Status.CLOSED,
        description: 'tu nie ma nic a teraz jest'
      };
      const result = { 
        id: 12,
        produktId: 22,
        variationId: 'ksjd8',
        produkt_name: 'dd jkasjhasd',
        quantity: 5,
        type: Destruction_Protocol_Type.Gestohlen,
        destruction_date: "2023-12-31T23:00:00.000Z",
        responsible_person: 'sadasd',
        status: Destruction_Protocol_Status.CLOSED,
        description: 'tu nie ma nic a teraz jest'
      };
      jest.spyOn(protocolRepo, 'create').mockReturnValueOnce(updatedProtocol);
      jest.spyOn(protocolRepo.manager, 'transaction')
        .mockImplementation(async (isoLevel: any, runIn: any) => {
          const transaction = {
            findOne: jest.fn().mockImplementation((data) => {
              return data.sku ? prod: item2;
            }),
            merge: jest.fn().mockImplementation((old, curr) => {
              return { ...old, ...curr};
            }),
            save: jest.fn().mockImplementation((data) => {
    
              return data.sku ? prod: result;
            })
          };
          if(isoLevel)
            return await isoLevel(transaction);

          return await runIn(transaction);
        })

      const requ = await request(app.getHttpServer())
        .put('/destruction-pro/1')
        .send(updatedProtocol)
        .expect(200);
     
      expect(requ.body).toEqual(result);
    });
  });
  
  afterAll(async () => {
    await app.close();
  });

});
