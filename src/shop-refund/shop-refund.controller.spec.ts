import { Test, TestingModule } from '@nestjs/testing';
import { ShopRefundController } from './shop-refund.controller';
import { Any, EntityManager, Repository } from 'typeorm';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { EbayRefund } from 'src/entity/ebay/ebayRefund';
import { ShopRefundService } from './shop-refund.service';
import { Product_RuckgabeDto } from 'src/dto/product_ruckgabe.dto';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { BestellungenService } from 'src/bestellungen/bestellungen.service';
import { ProduktVariations } from 'src/entity/produktVariations';
import { Bestellung } from 'src/entity/bestellungEntity';

describe('ShopRefundController', () => {
  let controller: ShopRefundController;
  let repo: Repository<ProduktRueckgabe>;
  let app: INestApplication;
  global.fetch = jest.fn();
  let prodRuckDto: Product_RuckgabeDto;
  const prodInBestellung: ProduktInBestellung[] = [];
  let paypalApiResponse = 'COMPLETE';
  let prodVari: ProduktVariations;
  let refund: ProduktRueckgabe;

  beforeEach(async () => {
    paypalApiResponse = 'COMPLETE';
    dataInintiation();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopRefundController],
      providers: [
        ShopRefundService,
        {
          provide: getRepositoryToken(ProduktRueckgabe),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(EbayRefund),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProduktVariations),
          useClass: Repository,
        },
        {
          provide: BestellungenService,
          useValue: {
            generateAccessToken: jest.fn(async () => 'token'),
          },
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
  it('should create new refund', async () => {
    jest
      .spyOn(repo, 'create')
      .mockImplementationOnce((dto) => dto as ProduktRueckgabe);
    const trans = jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementation((isolationOrCallback: any, maybeCallback?: any) => {
        const manager: Partial<EntityManager> = {
          save: jest.fn().mockImplementation((ent) => ent),
          findOne: jest.fn().mockResolvedValue(prodVari),
          // Add other methods if needed
        };
        if (maybeCallback) {
          // Two parameters passed, run the callback
          return maybeCallback(manager as EntityManager);
        } else {
          // Only one parameter, it must be the callback
          return isolationOrCallback(manager as EntityManager);
        }
      });

    const requ = await request(app.getHttpServer())
      .post('/shop-refund')
      .send(prodRuckDto)
      .expect(201);
    expect(trans).toHaveBeenCalled();
    expect(requ.body.amount).toBe(
      prodRuckDto.amount + prodRuckDto.produkte[0].verkauf_price,
    );
  });
  it('should throw not acceptable', async () => {
    paypalApiResponse = 'CANCELLED';
    prodRuckDto.bestellung.paypal_order_id = 'payid';
    prodRuckDto.is_corrective = 0;
    jest
      .spyOn(repo, 'create')
      .mockImplementationOnce((dto) => dto as ProduktRueckgabe);

    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ status: paypalApiResponse }), {
          status: 200,
        }),
      ),
    );

    const trans = jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementationOnce((islevel: any, callback?: any) => {
        const manager: Partial<EntityManager> = {
          save: jest.fn().mockImplementation((ent) => ent),
          findOne: jest.fn().mockResolvedValue(prodVari),
          // Add other methods if needed
        };
        if (callback) {
          return callback(manager as EntityManager);
        } else {
          return islevel(manager as EntityManager);
        }
      });
    await request(app.getHttpServer())
      .post('/shop-refund')
      .send(prodRuckDto)
      .expect(406);
    expect(trans).toHaveBeenCalledTimes(0);
  });
  it('should get item by id with  ', async () => {
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(refund);
    jest
      .spyOn(repo, 'save')
      .mockImplementation(async (ent) => ent as ProduktRueckgabe);
    paypalApiResponse = 'ERROR';

    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ status: paypalApiResponse }), {
          status: 200,
        }),
      ),
    );
    const requ = await request(app.getHttpServer())
      .get('/shop-refund/1')
      .expect(200);
    expect(requ.body).toEqual(refund);
    expect(requ.body.paypal_refund_status).toBe(paypalApiResponse);
  });
  it('should try to update refund, response is 406 not acceptable', async () => {
    const requ = await request(app.getHttpServer())
      .put('/shop-refund/1')
      .send(prodRuckDto)
      .expect(406);

    expect(requ.body.message).toBe('Refund update not possible');
  });
  it('should throw not found on delete refund', async () => {
    const id = 1;
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(null);
    const requ = await request(app.getHttpServer())
      .delete('/shop-refund/' + id)
      .expect(404);

    expect(requ.body.message).toBe(`Refund with id ${id} not found! `);
  });
  it('should delete refund ', async () => {
    refund.produkte[0].menge = 1;
    jest.spyOn(repo, 'findOne').mockResolvedValueOnce(refund);
    const prodVariSaved = {
      sku: 'jskdh2',
      produkt: undefined,
      variations_name: 'abd',
      hint: '',
      value: 'white',
      unit: '',
      image: '',
      price: 2.2,
      wholesale_price: 0,
      thumbnail: '',
      quanity: 5,
      quanity_sold: 2,
      quanity_sold_at_once: 1,
    };
    jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementation((islevel: any, runInTrans?: any) => {
        const manager = {
          findOne: jest.fn().mockImplementation(() => prodVari),
          save: jest.fn().mockImplementation((ent) => {
            return ent;
          }),
          delete: jest.fn().mockResolvedValueOnce({ raw: '', affected: 1 }),
        };
        if (runInTrans) {
          return runInTrans(manager);
        } else {
          return islevel(manager);
        }
      });

    const requ = await request(app.getHttpServer())
      .delete('/shop-refund/1')
      .expect(200);
    expect(prodVari.quanity).toBe(
      prodVariSaved.quanity -
        refund.produkte[0].menge * prodVariSaved.quanity_sold_at_once,
    );
    expect(requ.body).toEqual({ raw: '', affected: 1 });
  });
  function dataInintiation() {
    prodVari = {
      sku: 'jskdh2',
      produkt: undefined,
      variations_name: 'abd',
      hint: '',
      value: 'white',
      unit: '',
      image: '',
      price: 2.2,
      wholesale_price: 0,
      thumbnail: '',
      quanity: 5,
      quanity_sold: 2,
      quanity_sold_at_once: 1,
    };

    const prod1: Produkt = {
      id: 1,
      name: 'sdad sads',
      sku: 'jskdh2',
      artid: 213,
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
      variations: [prodVari],
      produkt_image: '',
      shipping_costs: [],
    };
    const prod2: Produkt = {
      id: 2,
      name: 'sdad 2 sads',
      sku: ' 2jskdh2',
      artid: 213,
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
      produkt_image: '',
      shipping_costs: [],
    };
    const prodInBest: ProduktInBestellung = {
      id: 1,
      bestellung: undefined,
      produkt: [prod1],
      menge: 1,
      color: '',
      color_gepackt: 'white',
      rabatt: 0,
      mengeGepackt: 0,
      verkauf_price: 2.2,
      verkauf_rabat: 0,
      verkauf_steuer: 0,
      productRucgabe: undefined,
    };
    refund = {
      id: 0,
      bestellung: undefined,
      produkte: [prodInBest],
      kunde: undefined,
      rueckgabegrund: 'bleh bleg',
      rueckgabedatum: undefined,
      rueckgabestatus: '',
      amount: 0,
      paypal_refund_id: 'aksjdhasd23',
      paypal_refund_status: 'COMPLETE',
      corrective_refund_nr: 0,
      is_corrective: 0,
    };
    const prodInBest2: ProduktInBestellung = {
      id: 2,
      bestellung: undefined,
      produkt: [prod2],
      menge: 1,
      color: '',
      color_gepackt: 'black',
      rabatt: 0,
      mengeGepackt: 0,
      verkauf_price: 1.25,
      verkauf_rabat: 0,
      verkauf_steuer: 0,
      productRucgabe: undefined,
    };
    prodInBestellung.push(prodInBest);
    prodInBestellung.push(prodInBest2);

    prodRuckDto = {
      bestellung: {
        paypal_refund_id: null,
      } as unknown as Bestellung,
      produkte: [prodInBest],
      kunde: undefined,
      rueckgabegrund: 'bleh',
      rueckgabestatus: '',
      amount: 2.2,
      paypal_refund_id: 'sjahdkhaskjhd',
      paypal_refund_status: 'COMPLETE',
      corrective_refund_nr: 0,
      is_corrective: 0,
    };
  }
});
