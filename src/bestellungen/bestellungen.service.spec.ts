import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BestellungenService } from './bestellungen.service';
import { BESTELLUNGSSTATUS, Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { OrderDto } from 'src/dto/order.dto';
import { Kunde } from 'src/entity/kundeEntity';
import { ProduktRueckgabe } from 'src/entity/productRuckgabeEntity';
import { Lieferant } from 'src/entity/lifernatEntity';
import { ProduktVariations } from 'src/entity/produktVariations';
import { Repository } from 'typeorm';
import { describe } from 'node:test';
import { GetOrderSettingsDto } from 'src/dto/getOrderSettings.dto';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';
import { LogsEntity } from 'src/entity/logsEntity';
import { EbayOffersService } from 'src/ebay/ebay-offers/ebay-offers.service';
import { EbayService } from 'src/ebay/ebay.service';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { MailService } from 'src/mail/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';

describe('BestellungenService', () => {
  let service: BestellungenService;
  let bestellungRepository: Repository<Bestellung>;
  //let productIn: Repository<ProduktInBestellung>;
  let productRepository: Repository<Produkt>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let logsRepo: Repository<LogsEntity>;
  let order: OrderDto;
  let product: Produkt;
  let currentKunde: Kunde;
  let compRepo: Repository<CompanyDataEntity>;
  let mailService: MailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BestellungenService,
        Produkt,
        ProduktInBestellung,
        {
          provide: getRepositoryToken(Bestellung),
          useValue: {
            findOne: jest.fn(),
            merge: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            create: jest.fn(),
            findAndCount: jest.fn(),
            manager: {
              transaction: jest.fn(),
              findOne: jest.fn(),
              merge: jest.fn(),
              save: jest.fn(),
              remove: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },

        {
          provide: getRepositoryToken(ProduktInBestellung),
          useValue: {
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
        EbayOffersService,
        EbayService,
        MailService,
        {
          provide: getRepositoryToken(CompanyDataEntity),
          useClass: Repository,
        },
      ],
      imports: [
        MailerModule.forRoot({
          transport: jest.fn(),
        }),
      ],
    }).compile();

    service = module.get<BestellungenService>(BestellungenService);
    mailService = module.get<MailService>(MailService);
    bestellungRepository = module.get(getRepositoryToken(Bestellung));
    compRepo = module.get<Repository<CompanyDataEntity>>(
      getRepositoryToken(CompanyDataEntity),
    );
    // productIn = module.get(getRepositoryToken(ProduktInBestellung));
    productRepository = module.get(getRepositoryToken(Produkt));
    logsRepo = module.get(getRepositoryToken(LogsEntity));

    currentKunde = {
      id: 1,
      vorname: 'TEST',
      nachname: 'ako',
      password: '',
      adresse: {
        id: 0,
        strasse: 'Sample Street',
        hausnummer: '123',
        stadt: 'Sample City',
        postleitzahl: '12345',
        land: 'Sample Country',
      },
      lieferadresse: {
        id: 0,
        shipping_name: 'shipping name',
        strasse: 'Sample Street',
        hausnummer: '123',
        stadt: 'Sample City',
        postleitzahl: '12345',
        land: 'Sample Country',
      },
      bestellungen: [],
      ruckgabe: [],
      email: 'kos@o2.pl',
      telefon: '',
      role: 'user',
      registrierungsdatum: undefined,
      treuepunkte: 0,
      bewertungen: [],
    };
    const prodVariant: ProduktVariations = {
      sku: 'sadas123_01',
      produkt: product,
      variations_name: 'color',
      hint: '',
      value: '01',
      unit: '',
      image: '',
      price: 2.25,
      wholesale_price: 3.45,
      thumbnail: '',
      quanity: 20,
      quanity_sold: 0,
      quanity_sold_at_once: 0,
    };
    product = {
      id: 2,
      name: 'piwko',
      sku: 'sadas123',
      artid: 22,
      beschreibung: '',
      lieferant: new Lieferant(),
      lagerorte: [],
      bestellungen: [],
      datumHinzugefuegt: undefined,
      kategorie: [],
      verfgbarkeit: 1,
      product_sup_id: '',
      ebay: 1,
      wareneingang: [],
      mehrwehrsteuer: 0,
      promocje: [],
      bewertung: [],
      eans: [],
      variations: [prodVariant],
      produkt_image: '',
      shipping_costs: [],
    };
    const produktB: ProduktInBestellung = {
      id: 2,
      bestellung: new Bestellung(),
      produkt: [product],
      menge: 2,
      color: '01',
      color_gepackt: '',
      rabatt: 0,
      mengeGepackt: 0,
      verkauf_price: 2.25,
      verkauf_rabat: 0,
      verkauf_steuer: 0,
      productRucgabe: new ProduktRueckgabe(),
    };
    order = {
      id: 0,
      kunde: currentKunde,
      produkte: [produktB],
      bestelldatum: undefined,
      status: '',
      versand_datum: undefined,
      zahlungsart: 'PAYPAL',
      gesamtwert: 2.25,
      zahlungsstatus: '',
      bestellungstatus: BESTELLUNGSSTATUS.INBEARBEITUNG,
      versandart: 'DPD',
      versandprice: 1.6,
      varsandnr: '',
      paypal_order_id: '',
      refunds: [],
      shipping_address_json: '',
    };
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const item = jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValueOnce(product);
      await service.createOrder(order);
      expect(item).toHaveBeenCalledWith({
        relations: {
          promocje: true,
          variations: true,
        },
        where: {
          id: product.id,
        },
        select: {
          id: true,
          promocje: true,
          variations: true,
          sku: true,
        },
      });
    });

    it('should throw an error if price or quantity is not valid', async () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde(),
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: BESTELLUNGSSTATUS.INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: '',
        paypal_order_id: '',
        refunds: [],
        shipping_address_json: '',
      };

      jest
        .spyOn(service, 'createOrder')
        .mockRejectedValueOnce(
          new HttpException(
            'Invalid price or quantity',
            HttpStatus.BAD_REQUEST,
          ),
        );

      await expect(service.createOrder(orderData)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getBestellung', () => {
    it('should return the specified order', async () => {
      jest
        .spyOn(bestellungRepository, 'findOne')
        .mockResolvedValueOnce(order as Bestellung);

      const result = await service.getOrderBeiId(order.id);

      expect(result).toBe(order);
    });

    it('should throw an error if order is not found', async () => {
      const orderId = 1;

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.getOrderBeiId(orderId)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateBestellung', () => {
    it('should update the specified order', async () => {
      jest
        .spyOn(bestellungRepository, 'findOne')
        .mockResolvedValueOnce(order as Bestellung);
      jest.spyOn(bestellungRepository, 'merge');
      jest
        .spyOn(bestellungRepository, 'save')
        .mockResolvedValueOnce(order as Bestellung);

      const result = await service.updateOrder(order.id, order);

      expect(result).toBe(order);
      expect(bestellungRepository.merge).toHaveBeenCalledWith(order, order);
      expect(bestellungRepository.save).toHaveBeenCalledWith(order);
    });

    it('should throw an error if order is not found', async () => {
      jest
        .spyOn(bestellungRepository, 'findOne')
        .mockResolvedValueOnce(undefined);

      await expect(service.updateOrder(order.id, order)).rejects.toThrow(
        HttpException,
      );
    });
  });
  describe('saveBestellung', () => {
    it('should save the specified order', async () => {
      // Mock the transaction method
      const mockEntityManger = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(currentKunde as unknown as unknown[]),
        save: jest.fn().mockResolvedValueOnce(order as Bestellung),
        create: jest.fn().mockResolvedValueOnce(order as Bestellung),
      };

      const mockTransaction = jest.fn().mockImplementation((entityManger) => {
        // Mock the entityManger within the transaction

        // Call the callback with the mockEntityManger
        return entityManger(mockEntityManger);
      });

      const entManger = jest
        .spyOn(bestellungRepository.manager, 'transaction')
        .mockImplementation(mockTransaction);
      const kunde = jest
        .spyOn(mockEntityManger, 'findOne')
        .mockResolvedValueOnce(currentKunde as unknown as unknown[]);
      //const createKunde = jest
      //  .spyOn(bestellungRepository.manager, 'create')
      //  .mockImplementation(() => currentKunde as unknown as unknown[]);
      const item = jest
        .spyOn(mockEntityManger, 'save')
        .mockResolvedValueOnce(order as Bestellung);
      const find = jest
        .spyOn(productRepository, 'findOne')
        .mockResolvedValueOnce(product as Produkt);

      await service.saveOrder(order);
      expect(find).toHaveBeenCalledWith({
        relations: {
          promocje: true,
          variations: true,
        },
        where: {
          id: product.id,
        },
        select: {
          id: true,
          promocje: true,
          variations: true,
          sku: true,
        },
      });
      expect(entManger).toHaveBeenCalledWith(expect.any(Function));
      expect(kunde).toHaveBeenCalledWith(Kunde, {
        relations: {
          adresse: true,
          lieferadresse: true,
        },
        where: {
          email: currentKunde.email,
        },
      });
      expect(item).toHaveBeenCalled();

      expect(item).toHaveBeenCalledWith(Bestellung, order);
    });
  });
  describe('getOrdersBeiKunde', () => {
    it('should return orders for a given customer', async () => {
      const kundeId = 1;
      const expectedOrders = [order as Bestellung];
      jest
        .spyOn(bestellungRepository, 'findAndCount')
        .mockResolvedValueOnce([expectedOrders, 1]);

      const [result, count] = await service.getOrdersBeiKunde(kundeId);

      expect(result).toBe(expectedOrders);
      expect(count).toBe(1);
    });

    it('should throw an error if no orders are found for the customer', async () => {
      const kundeId = 1;
      jest
        .spyOn(bestellungRepository, 'findAndCount')
        .mockResolvedValueOnce([[], 0]);

      const [result, count] = await service.getOrdersBeiKunde(kundeId);

      expect(result).toEqual([]);
      expect(count).toBe(0);
    });
  });
  describe('getOrders', () => {
    it('should return a list of orders based on provided settings', async () => {
      const getSettings = new GetOrderSettingsDto();
      getSettings.itemsProSite = 10;
      getSettings.state = 'ACTIVE';
      getSettings.status = BESTELLUNGSSTATUS.INBEARBEITUNG;
      const sitenr = 1;
      const expectedOrders = [order as Bestellung];
      jest
        .spyOn(bestellungRepository, 'findAndCount')
        .mockResolvedValueOnce([expectedOrders, 1]);

      const result = await service.getOrders(getSettings, sitenr);
      expect(result).toEqual([expectedOrders, 1]);
    });
  });
});
