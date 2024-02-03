import { Test, TestingModule } from '@nestjs/testing';
import { EbaySoldController } from './ebay-sold.controller';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { EbayTransactions } from 'src/entity/ebay/ebayTranscations';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EbaySoldService } from './ebay-sold.service';
import { EbayTranscationsDto } from 'src/dto/ebay/transactionAndRefunds/ebayTransactionDto';
import { EbayTransactionsItemDto } from 'src/dto/ebay/transactionAndRefunds/ebayTransactionItemDto';
import { ProduktVariations } from 'src/entity/produktVariations';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LogsEntity } from 'src/entity/logsEntity';

describe('EbaySoldController', () => {
  let controller: EbaySoldController;
  let app: INestApplication;
  let repo: Repository<EbayTransactions>;
  let logsRep: Repository<LogsEntity>;
  const transactionsArr: EbayTransactions[] = [];
  let trans: EbayTransactions = {} as EbayTransactions;
  let transDto: EbayTranscationsDto = {} as EbayTranscationsDto;
  let transDtoProd: EbayTransactionsItemDto = {} as EbayTransactionsItemDto;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbaySoldController],
      providers: [
        EbaySoldService,
        {
          provide: getRepositoryToken(EbayTransactions),
          useValue: {
            manager: {
              transaction: jest.fn(),
            },
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LogsEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        LogsService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();
    app = module.createNestApplication();
    repo = module.get<Repository<EbayTransactions>>(
      getRepositoryToken(EbayTransactions),
    );
    logsRep = module.get<Repository<LogsEntity>>(
      getRepositoryToken(LogsEntity),
    );
    controller = module.get<EbaySoldController>(EbaySoldController);
    await app.init();
    loadData();
  });
  afterEach(async () => {
    await jest.clearAllMocks();
    await app.close();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should get all transactions', async () => {
    jest.spyOn(repo, 'find').mockResolvedValueOnce(transactionsArr);

    const requ = await request(app.getHttpServer())
      .get('/ebay-sold')
      .expect(200);
    expect(requ.body).toEqual(transactionsArr);
  });
  it('should get transaction by id', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValue(trans);
    const requ = await request(app.getHttpServer())
      .get('/ebay-sold/1')
      .expect(200);

    expect(requ.body).toEqual(trans);
  });
  it('should throw error when transaction paid status is not PAID', async () => {
    transDto.payment_status = 'WATING';
    jest
      .spyOn(repo, 'create')
      .mockImplementationOnce((ent) => ent as EbayTransactions);
    const requ = await request(app.getHttpServer())
      .post('/ebay-sold/')
      .send(transDto)
      .expect(400);

    expect(requ.body.message).toBe('Transaction not paid !');
  });
  it('it should throw error when transcation not found', async () => {
    jest
      .spyOn(repo, 'create')
      .mockImplementationOnce((ent) => ent as EbayTransactions);
    jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementation(async (isIslevel: any, runInTran?: any) => {
        const manager: Partial<EntityManager> = {
          findOne: jest.fn().mockResolvedValue(null),
        };

        try {
          if (runInTran) return await runInTran(manager);
          else await isIslevel(manager);
        } catch (error) {
          throw error;
        }
      });

    const requ = await request(app.getHttpServer())
      .post('/ebay-sold/')
      .send(transDto)
      .expect(404);

    expect(requ.body.message).toBe(
      'Item not found in database !' + transDtoProd.sku,
    );
  });
  it('it should throw error when item qunatity its to big and we have not enoght', async () => {
    const prodVar: ProduktVariations = {
      sku: '',
      produkt: undefined,
      variations_name: '',
      hint: '',
      value: '',
      unit: '',
      image: '',
      price: 0,
      wholesale_price: 0,
      thumbnail: '',
      quanity: 1,
      quanity_sold: 0,
      quanity_sold_at_once: 1,
    };
    transDto.items[0].quanity = 5;
    jest
      .spyOn(repo, 'create')
      .mockImplementationOnce((ent) => ent as EbayTransactions);
    jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementation(async (isIslevel: any, runInTran?: any) => {
        const manager: Partial<EntityManager> = {
          findOne: jest.fn().mockResolvedValue(prodVar),
          save: jest.fn().mockImplementationOnce((ent) => ent),
        };

        try {
          if (runInTran) return await runInTran(manager);
          else await isIslevel(manager);
        } catch (error) {
          throw error;
        }
      });

    const requ = await request(app.getHttpServer())
      .post('/ebay-sold/')
      .send(transDto)
      .expect(406);

    expect(requ.body.message).toBe(
      'Not enough items in stock ! ' + transDtoProd.sku,
    );
  });
  it('it should create transaction', async () => {
    const prodVar: Partial<ProduktVariations> = {
      quanity: 1,
      quanity_sold: 0,
      quanity_sold_at_once: 1,
    };

    jest
      .spyOn(repo, 'create')
      .mockImplementationOnce((ent) => ent as EbayTransactions);
    jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementation(async (isIslevel: any, runInTran?: any) => {
        const manager: Partial<EntityManager> = {
          findOne: jest.fn().mockResolvedValue(prodVar),
          save: jest.fn().mockImplementation((ent) => {
            return {
              id: 1,
              ...ent,
            };
          }),
        };

        try {
          if (runInTran) return await runInTran(manager);
          else await isIslevel(manager);
        } catch (error) {
          throw error;
        }
      });

    const requ = await request(app.getHttpServer())
      .post('/ebay-sold/')
      .send(transDto)
      .expect(201);

    expect(requ.body.orderId).toBe('hasgd-hjsdg2-23');
  });
  function loadData() {
    trans = {
      id: 1,
      orderId: 'hasgd-hjsdg2-23',
      creationDate: undefined,
      price_total: 2.2,
      price_shipping: 1.6,
      price_tax: 0,
      price_discont: 0,
      sel_amount: 1,
      payment_status: 'Pay',
      items: [],
      refunds: [],
    };
    const trans2: EbayTransactions = {
      id: 2,
      orderId: 'has23gd-hjsdg22-23',
      creationDate: undefined,
      price_total: 2.5,
      price_shipping: 1.8,
      price_tax: 0,
      price_discont: 0,
      sel_amount: 1,
      payment_status: 'Pay',
      items: [],
      refunds: [],
    };
    transactionsArr.push(trans);
    transactionsArr.push(trans2);
    transDtoProd = {
      title: 'kolo koli',
      sku: 'sjd-ajsd',
      quanity: 0,
      price: 0,
      transaction: undefined,
    };
    transDto = {
      orderId: 'hasgd-hjsdg2-23',
      creationDate: undefined,
      payment_status: 'PAID',
      price_total: 2.2,
      price_shipping: 1.6,
      price_tax: 0,
      price_discont: 0,
      sel_amount: 1,
      items: [{ id: 0, ...transDtoProd }],
      refunds: [],
    };
  }
});
