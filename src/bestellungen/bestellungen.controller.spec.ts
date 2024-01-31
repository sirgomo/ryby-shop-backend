import { Test, TestingModule } from '@nestjs/testing';
import { BestellungenController } from './bestellungen.controller';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Produkt } from 'src/entity/produktEntity';
import {
  BESTELLUNGSSTATE,
  BESTELLUNGSSTATUS,
  Bestellung,
} from 'src/entity/bestellungEntity';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/auth/auth.jwtGuard.guard';
import { BestellungenService } from './bestellungen.service';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { GetOrderSettingsDto } from 'src/dto/getOrderSettings.dto';
import { Kunde } from 'src/entity/kundeEntity';
import { OrderDto } from 'src/dto/order.dto';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { Lieferant } from 'src/entity/lifernatEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import { Lieferadresse } from 'src/entity/liferAddresseEntity';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

describe('BestellungenController', () => {
  let controller: BestellungenController;
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let productRepo: Repository<Produkt>;
  let bestellungRepo: Repository<Bestellung>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  let logsRepo: Repository<LogsEntity>;
  // let logsService: LogsService;

  //let bestellungService: BestellungenService;
  //let produBestRepo: Repository<ProduktInBestellung>;

  const kund: Kunde = {
    id: 0,
    vorname: '',
    nachname: '',
    password: '',
    adresse: {
      id: 0,
      strasse: 'adsasd',
      hausnummer: 'asdsd',
      stadt: 'asdasd',
      postleitzahl: '33132',
      land: 'de',
    },
    lieferadresse: new Lieferadresse(),
    bestellungen: [],
    ruckgabe: [],
    email: 'sdasd@jsdasgd.pl',
    telefon: '',
    role: '',
    registrierungsdatum: undefined,
    treuepunkte: 0,
    bewertungen: [],
  };

  const prodVariationBase: ProduktVariations = {
    sku: 'asdadad',
    produkt: new Produkt(),
    variations_name: 'asdasd',
    hint: 'asd',
    value: 'asdads',
    unit: '1',
    image: 'asdasd',
    price: 1.3,
    wholesale_price: 1,
    thumbnail: '',
    quanity: 200,
    quanity_sold: 0,
    quanity_sold_at_once: 1,
  };
  const prodVariation2Base: ProduktVariations = {
    sku: 'asdasdasd',
    produkt: new Produkt(),
    variations_name: 'sasdasdasd',
    hint: 'as',
    value: 'asd',
    unit: '1',
    image: 'asd',
    price: 2.24,
    wholesale_price: 2,
    thumbnail: '',
    quanity: 500,
    quanity_sold: 0,
    quanity_sold_at_once: 10,
  };
  const prod2Base: Produkt = {
    id: 1,
    name: 'asdasdasdas sadasd',
    sku: '',
    artid: 0,
    beschreibung: '',
    lieferant: new Lieferant(),
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
    variations: [prodVariationBase],
    produkt_image: '',
    shipping_costs: [],
  };
  const prod1Base: Produkt = {
    id: 2,
    name: 'piwo ososd',
    sku: '',
    artid: 0,
    beschreibung: '',
    lieferant: new Lieferant(),
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
    variations: [prodVariation2Base],
    produkt_image: '',
    shipping_costs: [],
  };
  const prodVariation: ProduktVariations = {
    sku: 'asdadad',
    produkt: new Produkt(),
    variations_name: 'asdasd',
    hint: 'asd',
    value: 'asdads',
    unit: '1',
    image: 'asdasd',
    price: 1.3,
    wholesale_price: 1,
    thumbnail: '',
    quanity: 5,
    quanity_sold: 0,
    quanity_sold_at_once: 1,
  };
  const prodVariation2: ProduktVariations = {
    sku: 'asdasdasd',
    produkt: new Produkt(),
    variations_name: 'sasdasdasd',
    hint: 'as',
    value: 'asd',
    unit: '1',
    image: 'asd',
    price: 2.24,
    wholesale_price: 2,
    thumbnail: '',
    quanity: 10,
    quanity_sold: 0,
    quanity_sold_at_once: 10,
  };
  const prod2: Produkt = {
    id: 1,
    name: 'asdasdasdas sadasd',
    sku: '',
    artid: 0,
    beschreibung: '',
    lieferant: new Lieferant(),
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
    variations: [prodVariation],
    produkt_image: '',
    shipping_costs: [],
  };
  const prod1: Produkt = {
    id: 2,
    name: 'piwo ososd',
    sku: '',
    artid: 0,
    beschreibung: '',
    lieferant: new Lieferant(),
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
    variations: [prodVariation2],
    produkt_image: '',
    shipping_costs: [],
  };

  const prodIn1: ProduktInBestellung = {
    id: 0,
    bestellung: undefined,
    produkt: [prod1],
    menge: 5,
    color: 'asdadad',
    color_gepackt: '',
    rabatt: 0,
    mengeGepackt: 5,
    verkauf_price: 2.3,
    verkauf_rabat: 0,
    verkauf_steuer: 0,
    productRucgabe: new ProduktRueckgabe(),
  };
  const prodIn2: ProduktInBestellung = {
    id: 1,
    bestellung: undefined,
    produkt: [prod2],
    menge: 10,
    color: 'asdasdasd',
    color_gepackt: '',
    rabatt: 0,
    mengeGepackt: 10,
    verkauf_price: 1.2,
    verkauf_rabat: 0,
    verkauf_steuer: 0,
    productRucgabe: new ProduktRueckgabe(),
  };
  const best1: Bestellung = {
    id: 0,
    kunde: new Kunde(),
    produkte: [prodIn1],
    bestelldatum: undefined,
    status: '',
    versand_datum: undefined,
    zahlungsart: '',
    gesamtwert: 0,
    zahlungsstatus: '',
    bestellungstatus: BESTELLUNGSSTATUS.VERSCHICKT,
    versandart: 'LIST',
    versandprice: 0,
    varsandnr: '123',
    paypal_order_id: '',
    refunds: [],
  };
  const best2: Bestellung = {
    id: 1,
    kunde: new Kunde(),
    produkte: [prodIn2],
    bestelldatum: undefined,
    status: BESTELLUNGSSTATUS.INBEARBEITUNG,
    versand_datum: undefined,
    zahlungsart: '',
    gesamtwert: 0,
    zahlungsstatus: BESTELLUNGSSTATE.BEZAHLT,
    bestellungstatus: '',
    versandart: 'DHL',
    versandprice: 0,
    varsandnr: '345',
    paypal_order_id: '',
    refunds: [],
  };
  const orderSettings: GetOrderSettingsDto = {
    state: undefined,
    status: undefined,
    itemsProSite: undefined,
  };

  const orderDto: OrderDto = {
    id: 1,
    kunde: new Kunde(),
    produkte: [],
    bestelldatum: undefined,
    status: '',
    versand_datum: undefined,
    zahlungsart: 'PAYPAL',
    gesamtwert: 0,
    zahlungsstatus: '',
    bestellungstatus: undefined,
    versandart: '',
    versandprice: 0,
    varsandnr: '',
    paypal_order_id: '',
    refunds: [],
  };

  // Mock fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          id: '1',
          status: 'COMPLETED',
        }),
      status: 200,
    }),
  ) as jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestellungenController],
      providers: [
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProduktInBestellung),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Bestellung),
          useValue: {
            manager: {
              transaction: jest.fn(),
            },
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            merge: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LogsEntity),
          useClass: Repository,
        },
        BestellungenService,
        LogsService,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: true })
      .compile();
    app = module.createNestApplication();
    bestellungRepo = module.get<Repository<Bestellung>>(
      getRepositoryToken(Bestellung),
    );

    productRepo = module.get<Repository<Produkt>>(getRepositoryToken(Produkt));
    logsRepo = module.get<Repository<LogsEntity>>(
      getRepositoryToken(LogsEntity),
    );
    //bestellungService = module.get<BestellungenService>(BestellungenService);
    controller = module.get<BestellungenController>(BestellungenController);
    await app.init();
  });
  afterEach(async () => {
    await jest.clearAllMocks();
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('POST /all/get/:sitenr', () => {
    it('should return an error', async () => {
      jest.spyOn(bestellungRepo, 'findAndCount').mockResolvedValueOnce([[], 0]);

      const getall = await request(app.getHttpServer())
        .post('/order/all/get/1')
        .send(orderSettings)
        .expect(400);

      expect(getall.body.message).toBeInstanceOf(Array);
    });
    it('should return all orders', async () => {
      jest
        .spyOn(bestellungRepo, 'findAndCount')
        .mockResolvedValueOnce([[best1, best2], 2]);
      orderSettings.itemsProSite = 10;
      orderSettings.state = BESTELLUNGSSTATE.BEZAHLT;
      orderSettings.status = BESTELLUNGSSTATUS.INBEARBEITUNG;

      const getall = await request(app.getHttpServer())
        .post('/order/all/get/1')
        .send(orderSettings)
        .expect(201);
      expect(getall.body).toBeInstanceOf(Array);
      expect(getall.body[0].length).toBe(2);
      expect(getall.body[1]).toBe(2);
    });
  });
  describe('should update an order', () => {
    it('should update', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best1);

      const tmpItem: Bestellung = {} as Bestellung;
      Object.assign(tmpItem, best1);
      const tmpDate = new Date(Date.now()).toISOString() as unknown as Date;
      tmpItem.bestelldatum = tmpDate;
      tmpItem.status = BESTELLUNGSSTATUS.INBEARBEITUNG;

      jest.spyOn(bestellungRepo, 'merge').mockReturnThis();
      jest.spyOn(bestellungRepo, 'save').mockResolvedValueOnce(tmpItem);

      const update = await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(200);
      expect(update.body.bestelldatum).toBe(tmpDate);
      expect(update.body.status).toBe(BESTELLUNGSSTATUS.INBEARBEITUNG);
    });
    it('should return an error, item not found', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(null);
      jest
        .spyOn(bestellungRepo, 'merge')
        .mockImplementationOnce((entity, dto) => ({
          ...entity,
          ...(dto as Bestellung),
        }));
      jest.spyOn(bestellungRepo, 'save').mockReturnThis();
      await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(404);
    });
    it('An error should be thrown when the order is done and we wanna break it', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      orderDto.status = BESTELLUNGSSTATE.ABGEBROCHEN;
      best2.bestellungstatus = BESTELLUNGSSTATUS.VERSCHICKT;
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best2);
      jest.spyOn(bestellungRepo, 'merge').mockReturnThis();
      jest.spyOn(bestellungRepo, 'save').mockReturnThis();
      const requ = await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(400);
      expect(requ.body.message).toBe(
        'Bestellung kann nicht abgebrochen werden wenn es bereits verschickt wurde',
      );
    });
    it('An error should be thrown when the order is being processed but the status is changed to complet', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      orderDto.status = BESTELLUNGSSTATE.COMPLETE;
      best2.bestellungstatus = BESTELLUNGSSTATUS.INBEARBEITUNG;
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best2);
      jest.spyOn(bestellungRepo, 'merge').mockReturnThis();
      jest.spyOn(bestellungRepo, 'save').mockReturnThis();
      const requ = await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(400);
      expect(requ.body.message).toBe('Bestellung ist nocht nicht verschickt');
    });
    it('An error should be thrown when the order is being processed but the status is changed to archived', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      orderDto.status = BESTELLUNGSSTATE.ARCHIVED;
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best2);
      jest.spyOn(bestellungRepo, 'merge').mockReturnThis();
      jest.spyOn(bestellungRepo, 'save').mockReturnThis();
      const requ = await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(400);
      expect(requ.body.message).toBe('Bestellung ist nocht nicht verschickt');
    });
    it('An error should be thrown when the order is already complet or archiviert and we wanna something to change', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      best2.status = BESTELLUNGSSTATE.ABGEBROCHEN;
      orderDto.status = BESTELLUNGSSTATE.BEZAHLT;
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best2);
      jest.spyOn(bestellungRepo, 'merge').mockReturnThis();
      jest.spyOn(bestellungRepo, 'save').mockReturnThis();
      const requ = await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(400);
      expect(requ.body.message).toBe('Bestellung kann nicht geändert werden!');
    });
    it('It should throw an error when quantity are smaller then quantity shipped', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      const tmpProdInBeste: ProduktInBestellung = {} as ProduktInBestellung;
      Object.assign(tmpProdInBeste, prodIn1);
      tmpProdInBeste.menge = 5;
      tmpProdInBeste.mengeGepackt = 10;
      tmpProdInBeste.produkt = [prod1];
      orderDto.produkte = [tmpProdInBeste];

      const best: OrderDto = {} as OrderDto;
      Object.assign(best, orderDto);
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best1);
      jest.spyOn(bestellungRepo, 'merge').mockImplementation((entity, dto) => ({
        ...entity,
        ...(dto as Bestellung),
      }));
      jest.spyOn(bestellungRepo, 'save').mockResolvedValueOnce({
        ...best2,
        ...(orderDto as Bestellung),
      });
      await request(app.getHttpServer())
        .patch('/order/update')
        .send(best)
        .expect(400);
    });
    it('It should throw an error when order is shipped but we wanna change quantit', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      const tmpProdInBeste: ProduktInBestellung = {} as ProduktInBestellung;
      Object.assign(tmpProdInBeste, prodIn1);
      tmpProdInBeste.mengeGepackt = 5;
      tmpProdInBeste.menge = 15;
      tmpProdInBeste.produkt = [prod1];
      orderDto.produkte = [tmpProdInBeste];
      best1.bestellungstatus = BESTELLUNGSSTATUS.VERSCHICKT;
      orderDto.bestellungstatus = BESTELLUNGSSTATUS.VERSCHICKT;
      orderDto.status = BESTELLUNGSSTATE.BEZAHLT;
      const best: OrderDto = {} as OrderDto;
      Object.assign(best, orderDto);
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best1);
      jest.spyOn(bestellungRepo, 'merge').mockImplementation((entity, dto) => ({
        ...entity,
        ...(dto as Bestellung),
      }));
      jest.spyOn(bestellungRepo, 'save').mockResolvedValueOnce({
        ...best2,
        ...(orderDto as Bestellung),
      });
      await request(app.getHttpServer())
        .patch('/order/update')
        .send(best)
        .expect(406);
    });
    it('should save with no errors', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      const prodIn: ProduktInBestellung = {} as ProduktInBestellung;
      Object.assign(prodIn, prodIn2);
      prodIn.mengeGepackt = 5;
      orderDto.produkte = [prodIn];
      orderDto.paypal_order_id = 'kjahdhj7863';
      orderDto.versandprice = 3.45;
      best2.status = BESTELLUNGSSTATE.BEZAHLT;
      best2.bestellungstatus = BESTELLUNGSSTATUS.INBEARBEITUNG;
      orderDto.status = BESTELLUNGSSTATE.BEZAHLT;
      orderDto.bestellungstatus = BESTELLUNGSSTATUS.VERSCHICKT;
      jest.spyOn(bestellungRepo, 'findOne').mockResolvedValueOnce(best2);
      jest
        .spyOn(bestellungRepo, 'merge')
        .mockImplementationOnce((entity, dto) => ({
          ...entity,
          ...(dto as Bestellung),
        }));
      jest.spyOn(bestellungRepo, 'save').mockResolvedValueOnce({
        ...best2,
        ...(orderDto as Bestellung),
      });

      const requ = await request(app.getHttpServer())
        .patch('/order/update')
        .send(orderDto)
        .expect(200);
      expect(requ.body.paypal_order_id).toBe('kjahdhj7863');
      expect(requ.body.produkte[0].mengeGepackt).toBe(5);
      expect(requ.body.versandprice).toBe(3.45);
    });
  });
  describe('it should save order in database', () => {
    it('should call saveOrder when PayPal returns COMPLETED status', async () => {
      jest.spyOn(logsRepo, 'create').mockReturnThis();
      jest.spyOn(logsRepo, 'save').mockReturnThis();
      orderDto.produkte = [prodIn1, prodIn2];
      orderDto.kunde = kund;
      jest.spyOn(productRepo, 'findOne').mockImplementation((opt: any) => {
        const whereClause = Array.isArray(opt.where) ? opt.where[0] : opt.where;
        if (whereClause.id === prod1.id) return Promise.resolve(prod1Base);
        if (whereClause.id === prod2.id) return Promise.resolve(prod2Base);

        return Promise.resolve(null);
      });
      jest
        .spyOn(bestellungRepo.manager, 'transaction')
        .mockImplementation(async (isoLevel: any, runIn?: any) => {
          const manager = {
            findOne: jest.fn().mockResolvedValue(kund),
            create: jest.fn().mockImplementation((ent) => ent),
            save: jest.fn().mockImplementation((ent) => ent),
          };
          try {
            if (runIn) return await runIn(manager);

            return await isoLevel(manager);
          } catch (err) {
            console.log(err);
          }
        });

      const requ = await request(app.getHttpServer())
        .post('/order/capture')
        .send({ orderID: '1', bestellung: orderDto })
        .expect(201);
      expect(requ.body).toEqual({ id: '1', status: 'COMPLETED' });
      expect(global.fetch).toHaveBeenCalled();
      expect(bestellungRepo.manager.transaction).toHaveBeenCalled();
    });
  });
});
