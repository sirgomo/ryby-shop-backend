import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Lieferant } from 'src/entity/lifernatEntity';
import { DeleteResult, Repository } from 'typeorm';
import { LiferantService } from './liferant.service';
import { AdresseKunde } from 'src/entity/addressEntity';
import { LieferantDto } from 'src/dto/liferant.dto';
import { AddressDto } from 'src/dto/adress.dto';

describe('LiferantService', () => {
  let liferantService: LiferantService;
  let lieferantRepository: Repository<Lieferant>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LiferantService,
        {
          provide: getRepositoryToken(Lieferant),
          useClass: Repository,
        },
      ],
    }).compile();

    liferantService = moduleRef.get<LiferantService>(LiferantService);
    lieferantRepository = moduleRef.get<Repository<Lieferant>>(
      getRepositoryToken(Lieferant),
    );
  });

  describe('findAll', () => {
    it('should return an array of Lieferant', async () => {
      const item: Lieferant = {
        id: 1,
        name: '',
        produkte: [],
        email: '',
        telefon: '',
        adresse: new AdresseKunde(),
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: '',
        stellplatz: [],
        wareneingaenge: []
      }
      const lieferant: Lieferant[] = [item];
      jest
        .spyOn(lieferantRepository, 'find')
        .mockResolvedValueOnce(lieferant);

      const result = await liferantService.findAll();

      expect(result).toEqual(lieferant);
    });

    it('should throw an error if find operation fails', async () => {
      jest.spyOn(lieferantRepository, 'find').mockRejectedValueOnce(new Error());

      await expect(liferantService.findAll()).rejects.toThrowError();
    });
  });

  describe('findById', () => {
    it('should return Lieferant', async () => {
      const lieferant: Lieferant = {
        id: 1, name: 'Lieferant 1',
        produkte: [],
        email: '',
        telefon: '',
        adresse: new AdresseKunde(),
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: '',
        stellplatz: [],
        wareneingaenge: []
      };
      jest
        .spyOn(lieferantRepository, 'findOne')
        .mockResolvedValueOnce(lieferant);

      const result = await liferantService.findById(1);

      expect(result).toEqual(lieferant);
    });

    it('should throw an error if findOne operation fails', async () => {
      jest.spyOn(lieferantRepository, 'findOne').mockRejectedValueOnce(new Error());

      await expect(liferantService.findById(1)).rejects.toThrowError();
    });
  });

  describe('create', () => {
    it('should create a new Lieferant', async () => {
      const newLieferant: LieferantDto = {
        name: 'Lieferant 1',
        id: undefined,
        email: '',
        telefon: '',
        adresse: new AddressDto,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: ''
      };
      const createdLieferant: Lieferant = {
        id: 1, name: 'Lieferant 1',
        produkte: [],
        email: '',
        telefon: '',
        adresse: new AdresseKunde,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: '',
        stellplatz: [],
        wareneingaenge: []
      };
      jest.spyOn(lieferantRepository, 'create').mockImplementation();
      jest
        .spyOn(lieferantRepository, 'save')
        .mockResolvedValueOnce(createdLieferant);

      const result = await liferantService.create(newLieferant);

      expect(result).toEqual(createdLieferant);
    });

    it('should throw an error if save operation fails', async () => {
      const newLieferant: LieferantDto = {
        name: 'Lieferant 1',
        id: 0,
        email: '',
        telefon: '',
        adresse: new AddressDto,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: ''
      };
      jest.spyOn(lieferantRepository, 'save').mockRejectedValueOnce(new Error());

      await expect(liferantService.create(newLieferant)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update a Lieferant', async () => {
      const updatedLieferant: LieferantDto = {
        id: 1, name: 'Lieferant 1',
        email: '',
        telefon: '',
        adresse: new AddressDto,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: ''
      };
      const savedLieferant: Lieferant = {
        id: 1, name: 'Lieferant 1',
        produkte: [],
        email: '',
        telefon: '',
        adresse: new AdresseKunde,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: '',
        stellplatz: [],
        wareneingaenge: []
      };
      jest.spyOn(lieferantRepository, 'create').mockImplementation();
      jest.spyOn(lieferantRepository, 'findOne').mockImplementation();
      jest.spyOn(lieferantRepository, 'merge').mockImplementation();
      jest.spyOn(lieferantRepository, 'save')
        .mockResolvedValue(savedLieferant);

      const result = await liferantService.update(updatedLieferant);

      expect(result).toEqual(savedLieferant);
    });

 it('should throw an error if id not provided', async () => {
      const updatedLieferant: LieferantDto = {
        name: 'Lieferant 1',
        id: undefined,
        email: '',
        telefon: '',
        adresse: new AddressDto,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: ''
      };
      jest.spyOn(lieferantRepository, 'create').mockImplementation();
      await expect(liferantService.update(updatedLieferant)).rejects.toThrowError(
        new HttpException(
          'Etaws ist schiefgegangen, der liferant konnte nicht gespeichert werden',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if save operation fails', async () => {
      const updatedLieferant: LieferantDto = {
        id: 1, name: 'Lieferant 1',
        email: '',
        telefon: '',
        adresse: new AddressDto,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: ''
      };
      jest.spyOn(lieferantRepository, 'save').mockRejectedValueOnce(new Error());

      await expect(liferantService.update(updatedLieferant)).rejects.toThrowError();
    });
  });

  describe('', () => {
    it('should delete a Lieferant', async () => {
      const id = 1;
      const delRes: DeleteResult = {
        affected: 1,
        raw: undefined
      }
      const savedLieferant: Lieferant = {
        id: 1, name: 'Lieferant 1',
        produkte: [],
        email: '',
        telefon: '',
        adresse: new AdresseKunde,
        steuernummer: '',
        bankkontonummer: '',
        ansprechpartner: '',
        zahlart: '',
        umsatzsteuerIdentifikationsnummer: '',
        stellplatz: [],
        wareneingaenge: []
      };
       jest.spyOn(lieferantRepository, 'delete').mockResolvedValue(delRes);
       jest.spyOn(lieferantRepository, 'findOne').mockResolvedValue(savedLieferant);
       jest.spyOn(lieferantRepository, 'query').mockImplementation();

      await liferantService.delete(id);

      expect(lieferantRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw an error if delete operation fails', async () => {
      const id = 1;
      jest.spyOn(lieferantRepository, 'delete').mockRejectedValueOnce(new Error());

      await expect(liferantService.delete(id)).rejects.toThrowError();
    });
  });
});