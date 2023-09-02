import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BestellungenService } from './bestellungen.service';
import { Bestellung } from 'src/entity/bestellungEntity';
import { ProduktInBestellung } from 'src/entity/productBestellungEntity';
import { Produkt } from 'src/entity/produktEntity';
import { OrderDto } from 'src/dto/order.dto';
import { Payid } from 'src/dto/payId.dto';
import { PaypalItem } from 'src/dto/paypalItem.dto';

describe('BestellungenService', () => {
  let service: BestellungenService;
  let bestellungRepository;
  let productIn;
  let productRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BestellungenService,
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
          provide: getRepositoryToken(ProduktInBestellung),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Produkt),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BestellungenService>(BestellungenService);
    bestellungRepository = module.get(getRepositoryToken(Bestellung));
    productInRepository = module.get(getRepositoryToken(ProduktInBestellung));
    productRepository = module.get(getRepositoryToken(Produkt));
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData: OrderDto = {
        // mock order data
      };

      jest.spyOn(service, 'isPriceMengeChecked').mockResolvedValueOnce(true);
      jest.spyOn(service, 'getTotalPrice').mockReturnValueOnce(100);
      jest.spyOn(service, 'generateAccessToken').mockResolvedValueOnce('accessToken');

      const response = await service.createOrder(orderData);

      // assert the response
    });

    it('should throw an error if price or quantity is not valid', async () => {
      const orderData: OrderDto = {
        // mock order data
      };

      jest.spyOn(service, 'isPriceMengeChecked').mockRejectedValueOnce(new HttpException('Invalid price or quantity', HttpStatus.BAD_REQUEST));

      await expect(service.createOrder(orderData)).rejects.toThrow(HttpException);
    });
  });

  describe('getBestellung', () => {
    it('should return the specified order', async () => {
      const orderId = 1;
      const order = new Bestellung();

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(order);

      const result = await service.getBestellung(orderId);

      expect(result).toBe(order);
    });

    it('should throw an error if order is not found', async () => {
      const orderId = 1;

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.getBestellung(orderId)).rejects.toThrow(HttpException);
    });
  });

  describe('updateBestellung', () => {
    it('should update the specified order', async () => {
      const orderId = 1;
      const orderData: OrderDto = {
        // mock order data
      };
      const order = new Bestellung();

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(order);
      jest.spyOn(bestellungRepository, 'merge');
      jest.spyOn(bestellungRepository, 'save').mockResolvedValueOnce(order);

      const result = await service.updateBestellung(orderId, orderData);

      expect(result).toBe(order);
      expect(bestellungRepository.merge).toHaveBeenCalledWith(order, orderData);
      expect(bestellungRepository.save).toHaveBeenCalledWith(order);
    });

    it('should throw an error if order is not found', async () => {
      const orderId = 1;
      const orderData: OrderDto = {
        // mock order data
      };

      jest.spyOn(bestellungRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.updateBestellung(orderId, orderData)).rejects.toThrow(HttpException);
    });
  });

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
        // mock order data
      };

      const result = service.getTotalValue(orderData);

      // assert the result
    });
  });

  describe('saveOrder', () => {
    it('should save the order', async () => {
      const orderData: OrderDto = {
        // mock order data
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
        // mock order data
      };

      const result = service.getTotalTax(orderData);

      // assert the result
    });
  });

  describe('getPaypalItems', () => {
    it('should return the paypal items of the order', () => {
      const orderData: OrderDto = {
        // mock order data
      };

      const result = service.getPaypalItems(orderData);

      // assert the result
    });
  });

  describe('isPriceMengeChecked', () => {
    it('should check if the price and quantity of the products in the order are valid', async () => {
      const orderData: OrderDto = {
        // mock order data
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(new Produkt());
      jest.spyOn(productInRepository, 'findOne').mockResolvedValueOnce(new ProduktInBestellung());

      const result = await service.isPriceMengeChecked(orderData);

      // assert the result
    });

    it('should throw an error if the price or quantity of the products in the order are not valid', async () => {
      const orderData: OrderDto = {
        // mock order data
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(service.isPriceMengeChecked(orderData)).rejects.toThrow(HttpException);
    });
  });

  describe('getTotalPrice', () => {
    it('should calculate the total price of the order', () => {
      const orderData: OrderDto = {
        // mock order data
      };

      const result = service.getTotalPrice(orderData);

      // assert the result
    });
  });

  describe('getTax', () => {
    it('should calculate the tax of a product', () => {
      const orderData: OrderDto = {
        // mock order data
      };
      const index = 0;

      const result = service.getTax(orderData, index);

      // assert the result
    });
  });

  describe('getPiceNettoPrice', () => {
    it('should calculate the netto price of a product', () => {
      const orderData: OrderDto = {
        // mock order data
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
});