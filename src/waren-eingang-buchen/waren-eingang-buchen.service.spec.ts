import { Test, TestingModule } from '@nestjs/testing';
import { WarenEingangBuchenService } from './waren-eingang-buchen.service';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wareneingang } from 'src/entity/warenEingangEntity';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { WarenEingangDto } from 'src/dto/warenEingang.dto';
import { Lieferant } from 'src/entity/lifernatEntity';
import { LieferantDto } from 'src/dto/liferant.dto';
import { WareneingangProduct } from 'src/entity/warenEingangProductEntity';
import { WarenEingangProductDto } from 'src/dto/warenEingangProduct.dto';
import { Produkt } from 'src/entity/produktEntity';

describe('WarenEingangBuchenService', () => {
  let service: WarenEingangBuchenService;
  let warenEingangRepository: Repository<Wareneingang>;
  let warenEingangProductRepository: Repository<WareneingangProduct>;
  let prodRepo: Repository<Produkt>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarenEingangBuchenService,
        {
          provide: getRepositoryToken(Wareneingang),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(WareneingangProduct),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Produkt),
          useClass: Repository,
        },
      ],
 }).compile();

    service = module.get<WarenEingangBuchenService>(WarenEingangBuchenService);
    warenEingangRepository = module.get<Repository<Wareneingang>>(getRepositoryToken(Wareneingang));
    warenEingangProductRepository = module.get<Repository<WareneingangProduct>>(getRepositoryToken(WareneingangProduct));
    prodRepo = module.get<Repository<Produkt>>(getRepositoryToken(Produkt));
  });

  describe('getAll', () => {
    it('should return an array of wareneingang entries', async () => {
      const mockWareneingang = [
        { id: 1, name: 'Wareneingang 1' },
        { id: 2, name: 'Wareneingang 2' },
      ];
      jest.spyOn(warenEingangRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockWareneingang),
      } as any);

      const result = await service.getAll();

      expect(result).toEqual(mockWareneingang);
    });

    it('should throw an error if there is an error fetching the data', async () => {
      jest.spyOn(warenEingangRepository, 'createQueryBuilder').mockImplementation(() => { 
        throw new HttpException('Fehler beim Abrufen der Daten', HttpStatus.INTERNAL_SERVER_ERROR) }     
        );

      await expect(service.getAll()).rejects.toThrowError('Fehler beim Abrufen der Daten');
    });
  });

  describe('findById', () => {
    const mockWareneingang: Wareneingang = {
      id: 1,
      products: [],
      lieferant: {} as Lieferant,
      empfangsdatum: undefined,
      rechnung: 'ak-05',
      lieferscheinNr: '123',
      datenEingabe: undefined,
      gebucht: false,
      eingelagert: false
    };

    it('should return the wareneingang entry with the specified id', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockWareneingang);

      const result = await service.findById(1);

      expect(result).toEqual(mockWareneingang);
    });

    it('should throw a NotFoundException if the wareneingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findById(1)).rejects.toThrowError(NotFoundException);
    });

    it('should throw a NotFoundException if there is an error finding the wareneingang entry', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.findById(1)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('create', () => {
    const mockWareneingangDto: WarenEingangDto = {
      id: null,
      products: [],
      lieferant: {} as LieferantDto,
      empfangsdatum: undefined,
      rechnung: '65464',
      lieferscheinNr: '654',
      datenEingabe: undefined,
      gebucht: false,
      eingelagert: false
    };
    const mockCreatedWareneingang: Wareneingang = {
      id: 1,
      products: [],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '65464',
      lieferscheinNr: '654',
      datenEingabe: undefined,
      gebucht: false,
      eingelagert: false
    };

    it('should create a new wareneingang entry and return it', async () => {
      jest.spyOn(warenEingangRepository, 'create').mockReturnValue(mockCreatedWareneingang);
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValue(mockCreatedWareneingang);
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockCreatedWareneingang);

      const result = await service.create(mockWareneingangDto);

      expect(result).toEqual(mockCreatedWareneingang);
    });

    it('should throw an HttpException if there is an error creating the wareneingang entry', async () => {
      jest.spyOn(warenEingangRepository, 'create').mockReturnValue(mockCreatedWareneingang);
      jest.spyOn(warenEingangRepository, 'save').mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.create(mockWareneingangDto)).rejects.toThrowError(HttpException);
    });
  });

  describe('update', () => {
    const mockWareneingangDto: WarenEingangDto = {
      id: 1,
      products: [],
      lieferant: new LieferantDto,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      gebucht: false,
      eingelagert: false
    };
    const mockFoundWareneingang: Wareneingang = {
      id: 1, gebucht: false,
      products: [],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      eingelagert: false
    };
    const mockMergedWareneingang: Wareneingang = {
      id: 1, gebucht: false,
      products: [],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      eingelagert: false
    };
    const mockUpdatedWareneingang: Wareneingang = {
      id: 1, gebucht: false,
      products: [],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      eingelagert: false
    };

    it('should update the wareneingang entry and return the updated entry', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockFoundWareneingang);
      jest.spyOn(warenEingangRepository, 'merge').mockReturnValue(mockMergedWareneingang);
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValue(mockUpdatedWareneingang);

      const result = await service.update(mockWareneingangDto);

      expect(result).toEqual(mockUpdatedWareneingang);
    });

    it('should throw a NotFoundException if the wareneingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.update(mockWareneingangDto)).rejects.toThrowError(NotFoundException);
    });

    it('should throw a HttpException if the wareneingang entry is already gebucht', async () => {
      const foundWareneingang: Wareneingang = {
        id: 1, gebucht: true,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '',
        lieferscheinNr: '',
        datenEingabe: undefined,
        eingelagert: false
      };
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(foundWareneingang);

      await expect(service.update(mockWareneingangDto)).rejects.toThrowError(HttpException);
    });

    it('should throw a HttpException if there is an error updating the wareneingang entry', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockFoundWareneingang);
      jest.spyOn(warenEingangRepository, 'merge').mockReturnValue(mockMergedWareneingang);
      jest.spyOn(warenEingangRepository, 'save').mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.update(mockWareneingangDto)).rejects.toThrowError(HttpException);
    });
  });

  describe('delete', () => {
    const mockFoundWareneingang: Wareneingang = {
      id: 1, gebucht: false,
      products: [],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      eingelagert: false
    };

    it('should delete the wareneingang entry and return the number of affected rows', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockFoundWareneingang);
      jest.spyOn(warenEingangRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.delete(1);

      expect(result).toEqual(1);
    });

    it('should throw a NotFoundException if the wareneingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.delete(1)).rejects.toThrowError(NotFoundException);
    });

    it('should throw a HttpException if the wareneingang entry is already gebucht', async () => {
      const foundWareneingang: Wareneingang = {
        id: 1, gebucht: true,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '',
        lieferscheinNr: '',
        datenEingabe: undefined,
        eingelagert: false
      };
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(foundWareneingang);

      await expect(service.delete(1)).rejects.toThrowError(HttpException);
    });

    it('should throw a HttpException if there is an error deleting the wareneingang entry', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockFoundWareneingang);
      jest.spyOn(warenEingangRepository, 'delete').mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.delete(1)).rejects.toThrowError(HttpException);
    });
  });

  describe('addProduct', () => {
    const mockWareneingangId = 1;
    const mockProductDto: WarenEingangProductDto = {
      id: null,
      wareneingang: new Wareneingang,
      produkt: [],
      menge: 2,
      preis: 2.2,
      mwst: 0,
      mengeEingelagert: 0,
      color: ''
    };
    const mockWareneingang: Wareneingang = {
      id: 1, 
      gebucht: false, 
      products: [],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      eingelagert: false
    };
    const mockProduct: WareneingangProduct = {
      id: 1,
      wareneingang: new Wareneingang,
      produkt: [],
      menge: 2,
      preis: 2.2,
      mwst: 0,
      mengeEingelagert: 0,
      color: ''
    };
    const mockSavedWareneingang: Wareneingang = {
      id: 1, gebucht: false, products: [mockProduct],
      lieferant: new Lieferant,
      empfangsdatum: undefined,
      rechnung: '',
      lieferscheinNr: '',
      datenEingabe: undefined,
      eingelagert: false
    };

    it('should add the product to the wareneingang entry and return the newly added product', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockWareneingang);
      jest.spyOn(warenEingangProductRepository, 'create').mockReturnValue(mockProduct);
      jest.spyOn(warenEingangRepository, 'save').mockResolvedValue(mockSavedWareneingang);

      const result = await service.addProduct(mockWareneingangId, mockProductDto);

      expect(result).toEqual(mockProduct);
    });

    it('should throw a NotFoundException if the wareneingang entry is not found', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.addProduct(mockWareneingangId, mockProductDto)).rejects.toThrowError(NotFoundException);
    });

    it('should throw a HttpException if the wareneingang entry is already gebucht', async () => {
      const foundWareneingang: Wareneingang = {
        id: 1, gebucht: true,
        products: [],
        lieferant: new Lieferant,
        empfangsdatum: undefined,
        rechnung: '',
        lieferscheinNr: '',
        datenEingabe: undefined,
        eingelagert: false
      };
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(foundWareneingang);

      await expect(service.addProduct(mockWareneingangId, mockProductDto)).rejects.toThrowError(HttpException);
    });

    it('should throw a HttpException if there is an error adding the product', async () => {
      jest.spyOn(warenEingangRepository, 'findOne').mockResolvedValue(mockWareneingang);
      jest.spyOn(warenEingangRepository, 'save').mockRejectedValue(new Error('Internal Server Error'));

      await expect(service.addProduct(mockWareneingangId, mockProductDto)).rejects.toThrowError(HttpException);
    });
  });

});