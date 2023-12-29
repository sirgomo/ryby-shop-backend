import { Test, TestingModule } from '@nestjs/testing';
import { LiferantController } from './liferant.controller';
import { LiferantService } from './liferant.service';
import { LieferantDto } from 'src/dto/liferant.dto';
import { Lieferant } from 'src/entity/lifernatEntity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdresseKunde } from 'src/entity/addressEntity';
import { AddressDto } from 'src/dto/adress.dto';

describe('Liferant', () => {
  let controller: LiferantController;
  let service: LiferantService;
  let repository: Repository<Lieferant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiferantController],
      providers: [
        LiferantService,
        {
          provide: getRepositoryToken(Lieferant),
          useClass: Repository,
        },
      ],
    }).compile();
    repository = module.get<Repository<Lieferant>>(
      getRepositoryToken(Lieferant),
    );
    controller = module.get<LiferantController>(LiferantController);
    service = module.get<LiferantService>(LiferantService);
  });

  describe('findAll', () => {
    it('should return an array of lieferants', async () => {
      const tmpLif: Lieferant = {
        id: 1,
        name: 'sdasd',
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
        wareneingaenge: [],
      };
      const result: Lieferant[] = [tmpLif];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(repository.find).toBeCalled();
    });
  });

  describe('findById', () => {
    it('should return a lieferant', async () => {
      const tmpLif: Lieferant = {
        id: 1,
        name: 'sdasd',
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
        wareneingaenge: [],
      };

      jest.spyOn(service, 'findById').mockResolvedValue(tmpLif);

      expect(await controller.findById(1)).toBe(tmpLif);
    });
  });

  describe('create', () => {
    it('should create a new lieferant', async () => {
      const lieferantDto: LieferantDto = {
        name: 'Lieferant 1',
        email: 'lieferant1@example.com',
        telefon: '123456789',
        steuernummer: '123456',
        bankkontonummer: '1234567890',
        ansprechpartner: 'John Doe',
        zahlart: 'Rechnung',
        umsatzsteuerIdentifikationsnummer: '1234567890',
        adresse: new AddressDto(),
        id: undefined,
      };
      const result: Lieferant = {
        id: 1,
        ...lieferantDto,
        produkte: [],
        stellplatz: [],
        wareneingaenge: [],
      };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(lieferantDto)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a lieferant', async () => {
      const lieferantDto: LieferantDto = {
        id: 1,
        name: 'Lieferant 1',
        email: 'lieferant1@example.com',
        telefon: '123456789',
        steuernummer: '123456',
        bankkontonummer: '1234567890',
        ansprechpartner: 'John Doe',
        zahlart: 'Rechnung',
        umsatzsteuerIdentifikationsnummer: '1234567890',
        adresse: new AddressDto(),
      };
      const result: Lieferant = {
        id: 1,
        ...lieferantDto,
        produkte: [],
        stellplatz: [],
        wareneingaenge: [],
      };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(lieferantDto)).toBe(result);
    });
  });

  describe('delete', () => {
    it('should delete a lieferant', async () => {
      const id = 1;
      jest.spyOn(service, 'delete').mockResolvedValue(1);

      expect(await controller.delete(id)).toBe(1);
    });
  });
});
