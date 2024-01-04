import { Test, TestingModule } from '@nestjs/testing';
import { ShopRefundController } from './shop-refund.controller';
import { Repository } from 'typeorm';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { ShopRefundService } from './shop-refund.service';
import { Product_RuckgabeDto } from 'src/dto/product_ruckgabe.dto';

describe('ShopRefundController', () => {
  let controller: ShopRefundController;
  let repo: Repository<ProduktRueckgabe>;
  let app: INestApplication;
  global.fetch = jest.fn();
  let prodRuckDto: Product_RuckgabeDto;
  beforeEach(async () => {
    prodRuckDto = {
      bestellung: undefined,
      produkte: [],
      kunde: undefined,
      rueckgabegrund: 'bleh',
      rueckgabestatus: '',
      amount: 2.2,
      paypal_refund_id: 'sjahdkhaskjhd',
      paypal_refund_status: 'COMPLETE',
      corrective_refund_nr: 0,
      is_corrective: 0,
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopRefundController],
      providers: [
        ShopRefundService,
        {
          provide: getRepositoryToken(ProduktRueckgabe),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EbayRefund),
          useClass: Repository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();

    repo = module.get<Repository<ProduktRueckgabe>>(
      getRepositoryToken(ProduktRueckgabe),
    );
    controller = module.get<ShopRefundController>(ShopRefundController);
    app = module.createNestApplication();
    await app.init();
  });
  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  if (('should create new refund', async () => {}));
});
