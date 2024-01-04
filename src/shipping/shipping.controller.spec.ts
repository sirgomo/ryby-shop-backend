import { Test, TestingModule } from '@nestjs/testing';
import { ShippingController } from './shipping.controller';
import request from 'supertest';
import { Repository } from 'typeorm';
import { ShippingEntity } from 'src/entity/shippingEntity';
import { ShippingService } from './shipping.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { INestApplication } from '@nestjs/common';
import { ShippingCostDto } from 'src/dto/shippingCost.dto';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';

describe('ShippingController', () => {
  let controller: ShippingController;
  let shippRepo: Repository<ShippingEntity>;
  let app: INestApplication;

  const shipOp: ShippingEntity = {
    id: 1,
    shipping_name: 'dhl',
    shipping_price: 3.99,
    average_material_price: 0,
    produkt: [],
    cost_per_added_stuck: 0,
  };
  const shipOp2: ShippingEntity = {
    id: 2,
    shipping_name: 'list',
    shipping_price: 1.6,
    average_material_price: 0,
    produkt: [],
    cost_per_added_stuck: 0,
  };
  const shippingOpt = [shipOp, shipOp2];
  const shipDto: ShippingCostDto = {
    id: undefined,
    shipping_name: 'pack',
    shipping_price: 1.3,
    average_material_price: 0,
    produkt: [],
    cost_per_added_stuck: 0,
  };
  beforeEach(async () => {
    shipDto.id = undefined;
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShippingController],
      providers: [
        ShippingService,
        {
          provide: getRepositoryToken(ShippingEntity),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();
    shippRepo = module.get<Repository<ShippingEntity>>(
      getRepositoryToken(ShippingEntity),
    );
    controller = module.get<ShippingController>(ShippingController);
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(() => {
    app.close();
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should get all Shippings options', async () => {
    jest.spyOn(shippRepo, 'find').mockResolvedValueOnce(shippingOpt);

    const requ = await request(app.getHttpServer())
      .get('/shipping')
      .expect(200);

    expect(requ.body).toEqual(shippingOpt);
  });
  it('should get shipping by id', async () => {
    jest.spyOn(shippRepo, 'findOne').mockResolvedValueOnce(shipOp);

    const requ = await request(app.getHttpServer())
      .get('/shipping/1')
      .expect(200);

    expect(requ.body).toEqual(shipOp);
  });
  it('should update shipping by id', async () => {
    shipDto.id = 1;
    jest
      .spyOn(shippRepo, 'update')
      .mockResolvedValueOnce({ raw: '', affected: 1, generatedMaps: [] });

    const requ = await request(app.getHttpServer())
      .put('/shipping/1')
      .send(shipDto)
      .expect(200);

    expect(requ.body).toEqual({ raw: '', affected: 1, generatedMaps: [] });
  });
  it('should create shipping', async () => {
    jest.spyOn(shippRepo, 'save').mockResolvedValueOnce(shipOp2);

    const requ = await request(app.getHttpServer())
      .post('/shipping')
      .send(shipDto)
      .expect(201);

    expect(requ.body).toEqual({ ...shipDto, ...shipOp2 });
  });
  it('should delete shipping', async () => {
    jest
      .spyOn(shippRepo, 'delete')
      .mockResolvedValueOnce({ raw: '', affected: 1 });

    const requ = await request(app.getHttpServer())
      .delete('/shipping/2')
      .expect(200);

    expect(requ.body).toEqual({ raw: '', affected: 1 });
  });
});
