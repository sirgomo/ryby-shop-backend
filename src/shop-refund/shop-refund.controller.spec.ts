import { Test, TestingModule } from '@nestjs/testing';
import { ShopRefundController } from './shop-refund.controller';
import { EntityManager, Repository } from 'typeorm';
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
import {
  BestellungenService,
  generateAccessToken,
} from 'src/bestellungen/bestellungen.service';
import { ProduktVariations } from 'src/entity/produktVariations';
import { Bestellung } from 'src/entity/bestellungEntity';

describe('ShopRefundController', () => {
  let controller: ShopRefundController;
  let repo: Repository<ProduktRueckgabe>;
  let app: INestApplication;
  global.fetch = jest.fn();
  let prodRuckDto: Product_RuckgabeDto;
  const prodInBestellung: ProduktInBestellung[] = [];
  let bestServ: BestellungenService;
  const apiResponse = 'COMPLETE';
  let prodVari: ProduktVariations;
  let refund: ProduktRueckgabe;
  let variationsRepository: Repository<ProduktVariations>;

  beforeEach(async () => {
    dataInintiation();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopRefundController],
      providers: [
        ShopRefundService,
        {
          provide: getRepositoryToken(ProduktRueckgabe),
          useValue: {
            create: jest.fn(),
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
            handleResponse: jest.fn(async () => apiResponse),
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
    variationsRepository = module.get<Repository<ProduktVariations>>(
      getRepositoryToken(ProduktVariations),
    );
    bestServ = module.get<BestellungenService>(BestellungenService);
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
    const response = new Response(JSON.stringify({ status: apiResponse }), {
      status: 200,
    });
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(Promise.resolve(response));
    const trans = jest
      .spyOn(repo.manager, 'transaction')
      .mockImplementation((isolationOrCallback: any, maybeCallback?: any) => {
        const manager: Partial<EntityManager> = {
          save: jest.fn().mockResolvedValue(true),
          findOne: jest.fn().mockResolvedValue({}),
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
    const prodVar = jest
      .spyOn(variationsRepository, 'findOne')
      .mockResolvedValueOnce(prodVari);

    const requ = await request(app.getHttpServer())
      .post('/shop-refund')
      .send(prodRuckDto)
      .expect(201);
    expect(trans).toHaveBeenCalled();
    expect(prodVar).toHaveBeenCalled();
    console.log(requ.body);
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

    refund = {
      id: 0,
      bestellung: undefined,
      produkte: [],
      kunde: undefined,
      rueckgabegrund: '',
      rueckgabedatum: undefined,
      rueckgabestatus: '',
      amount: 0,
      paypal_refund_id: '',
      paypal_refund_status: '',
      corrective_refund_nr: 0,
      is_corrective: 0,
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
      variations: [],
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
      verkauf_price: 2.25,
      verkauf_rabat: 0,
      verkauf_steuer: 0,
      productRucgabe: undefined,
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
