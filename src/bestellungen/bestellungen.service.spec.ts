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



describe('BestellungenService', () => {
  let service: BestellungenService;
  let bestellungRepository: Repository<Bestellung>;
  let productIn: Repository<ProduktInBestellung>;
  let productRepository: Repository<Produkt>;
  let order: OrderDto;
  let product: Produkt

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
      ],
    }).compile();

    service = module.get<BestellungenService>(BestellungenService);
    bestellungRepository = module.get(getRepositoryToken(Bestellung));
    productIn = module.get(getRepositoryToken(ProduktInBestellung));
    productRepository = module.get(getRepositoryToken(Produkt));

    
    const kunde : Kunde = {
      id: 0,
      vorname: 'TEST',
      nachname: 'ako',
      password: '',
      adresse: {
        id: 0,
        strasse: 'Sample Street',
        hausnummer: '123',
        stadt: 'Sample City',
        postleitzahl: '12345',
        land: 'Sample Country'
      },
      lieferadresse: {
        id: 0,
        shipping_name: 'shipping name',
        strasse: 'Sample Street',
        hausnummer: '123',
        stadt: 'Sample City',
        postleitzahl: '12345',
        land: 'Sample Country'
      },
      bestellungen: [],
      ruckgabe: [],
      email: 'kos@o2.pl',
      telefon: '',
      role: 'user',
      registrierungsdatum: undefined,
      treuepunkte: 0,
      bewertungen: []
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
      quanity_sold: 0
    };
    product = {
      id: 2,
      name: 'piwko',
      sku: 'sadas123',
      artid: 22,
      beschreibung: '',
      lieferant: new Lieferant,
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
      shipping_costs: []
    };
    const produktB: ProduktInBestellung = {
      id: 2,
      bestellung: new Bestellung,
      produkt: [product],
      menge: 2,
      color: '01',
      color_gepackt: '',
      rabatt: 0,
      mengeGepackt: 0,
      verkauf_price: 2.25,
      verkauf_rabat: 0,
      verkauf_steuer: 0,
      productRucgabe: new ProduktRueckgabe
    };
    order = {
      id: 0,
      kunde: kunde,
      produkte: [produktB],
      bestelldatum: undefined,
      status: '',
      versand_datum: undefined,
      zahlungsart: 'PAYPAL',
      gesamtwert: 2.25,
      zahlungsstatus:  '',
      bestellungstatus: BESTELLUNGSSTATUS.INBEARBEITUNG,
      versandart: 'DPD',
      versandprice: 1.6,
      varsandnr: ''
    };
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {


      const item = jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(product);
     await service.createOrder(order);
      expect(item).toHaveBeenCalledWith( {
           "relations":  {
             "promocje": true,
            "variations": true,
           },
           "where":  {
              "id": product.id,
         },
          },);
    
      // assert the response
    });

    it('should throw an error if price or quantity is not valid', async () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
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
        varsandnr: ''
      };

      jest.spyOn(service, 'createOrder').mockRejectedValueOnce(new HttpException('Invalid price or quantity', HttpStatus.BAD_REQUEST));

      await expect(service.createOrder(orderData)).rejects.toThrow(HttpException);
    });
  });


  describe('getBestellung', () => {
    it('should return the specified order', async () => {


      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(order as Bestellung);

      const result = await service.getOrderBeiId(order.id);

      expect(result).toBe(order);
    });

    it('should throw an error if order is not found', async () => {
      const orderId = 1;

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.getOrderBeiId(orderId)).rejects.toThrow(HttpException);
    });
  });

  describe('updateBestellung', () => {
    it('should update the specified order', async () => {


      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(order as Bestellung);
      jest.spyOn(bestellungRepository, 'merge');
      jest.spyOn(bestellungRepository, 'save').mockResolvedValueOnce(order as Bestellung);

      const result = await service.updateOrder(order.id, order);

      expect(result).toBe(order);
      expect(bestellungRepository.merge).toHaveBeenCalledWith(order, order);
      expect(bestellungRepository.save).toHaveBeenCalledWith(order);
    });

    it('should throw an error if order is not found', async () => {


      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.updateOrder(order.id, order)).rejects.toThrow(HttpException);
    });
  });
});
/*
  describe('deleteBestellung', () => {
    it('should delete the specified order', async () => {
      const orderId = 1;
      const order = new Bestellung();

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(order);
      jest.spyOn(bestellungRepository, 'remove');

      await service.deleteBestellung(orderId);

      expect(bestellungRepository.remove).toHaveBeenCalledWith(order);
    });

    it('should throw an error if order is not found', async () => {
      const orderId = 1;

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.deleteBestellung(orderId)).rejects.toThrow(HttpException);
    });
  });

  describe('getTotalValue', () => {
    it('should calculate the total value of the order', () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      const result = service.getTotalValue(orderData);

      // assert the result
    });
  });

  describe('saveOrder', () => {
    it('should save the order', async () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      jest.spyOn(service, 'isPriceMengeChecked').mockResolvedValueOnce(true);
      jest.spyOn(service, 'getTotalPrice').mockReturnValueOnce(100);

      await service.saveOrder(orderData);

      // assert the result
    });
  });

  describe('getTotalTax', () => {
    it('should calculate the total tax of the order', () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      const result = service.getTotalTax(orderData);

      // assert the result
    });
  });

  describe('getPaypalItems', () => {
    it('should return the paypal items of the order', () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      const result = service.getPaypalItems(orderData);

      // assert the result
    });
  });

  describe('isPriceMengeChecked', () => {
    it('should check if the price and quantity of the products in the order are valid', async () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(new Produkt());
      jest.spyOn(productInRepository, 'findOne').mockResolvedValueOnce(new ProduktInBestellung());

      const result = await service.isPriceMengeChecked(orderData);

      // assert the result
    });

    it('should throw an error if the price or quantity of the products in the order are not valid', async () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.isPriceMengeChecked(orderData)).rejects.toThrow(HttpException);
    });
  });

  describe('getTotalPrice', () => {
    it('should calculate the total price of the order', () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };

      const result = service.getTotalPrice(orderData);

      // assert the result
    });
  });

  describe('getTax', () => {
    it('should calculate the tax of a product', () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };
      const index = 0;

      const result = service.getTax(orderData, index);

      // assert the result
    });
  });

  describe('getPiceNettoPrice', () => {
    it('should calculate the netto price of a product', () => {
      const orderData: OrderDto = {
        id: 0,
        kunde: new Kunde,
        produkte: [],
        bestelldatum: undefined,
        status: '',
        versand_datum: undefined,
        zahlungsart: '',
        gesamtwert: 0,
        zahlungsstatus: '',
        bestellungstatus: "/home/sirgomo/sklepRyby/ryby-shop-backend/src/entity/bestellungEntity".INBEARBEITUNG,
        versandart: '',
        versandprice: 0,
        varsandnr: ''
      };
      const index = 0;

      const result = service.getPiceNettoPrice(orderData, index);

      // assert the result
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', async () => {
      jest.spyOn(service, 'generateAccessToken').mockResolvedValueOnce('accessToken');

      const result = await service.generateAccessToken();

      expect(result).toBe('accessToken');
    });
  });

  describe('handleResponse', () => {
    it('should handle the response and return the json data', async () => {
      const response = {
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ id: '123', status: 'COMPLETED' }),
        text: jest.fn(),
      };

      const result = await service.handleResponse(response);

      expect(result).toEqual({ id: '123', status: 'COMPLETED' });
      expect(response.json).toHaveBeenCalled();
      expect(response.text).not.toBeenCalled();
    });

    it('should handle the response and throw an error if status is not 200 or 201', async () => {
      const response = {
        status: 400,
        json: jest.fn(),
        text: jest.fn().mockResolvedValueOnce('Error message'),
      };

      await expect(service.handleResponse(response)).rejects.toThrow(Error);
      expect(response.text).toHaveBeenCalled();
    });
  });

  describe('capturePayment', () => {
    it('should capture the payment and save the order if successful', async () => {
      const data: Payid = {
        orderID: '123',
        bestellung: new OrderDto(),
      };

      jest.spyOn(service, 'generateAccessToken').mockResolvedValueOnceaccessToken');
      jest.spyOn(service, 'handleResponse').mockResolvedValueOnce({ id: '123', status: 'COMPLETED' });
      jest.spy(service, 'save');

      const result = await service.capturePayment(data);

      expect(result).toEqual({ id: '123', status: 'COMPLETED' });
      expect(service.saveOrder).toHaveBeenCalledWith(data.bestellung);
    });
  });

  describe('generateClientToken', () => {
    it('should generate a client token', async () => {
      jest.spyOn(service, 'generateAccessToken').mockResolvedValueOnce('accessToken');

      const result = await service.generateClientToken();

      // assert the result
    });
  });
});*/