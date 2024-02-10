import { Test, TestingModule } from '@nestjs/testing';
import { AktionService } from './aktion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Aktion } from 'src/entity/aktionEntity';
import { EntityManager, Repository } from 'typeorm';
import { AktionDto } from 'src/dto/aktion.dto';
import { Produkt } from 'src/entity/produktEntity';

const mockAktionRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneOrFail: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  manager: {
    transaction: jest.fn(),
  },
};

const mockAktion: Aktion = {
  id: 0,
  aktion_key: 'jiasdh ',
  produkt: [],
  startdatum: undefined,
  enddatum: undefined,
  rabattProzent: 0,
};

describe('AktionService', () => {
  let service: AktionService;
  let repository: Repository<Aktion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AktionService,
        {
          provide: getRepositoryToken(Aktion),
          useValue: mockAktionRepository,
        },
      ],
    }).compile();

    service = module.get<AktionService>(AktionService);
    repository = module.get<Repository<Aktion>>(getRepositoryToken(Aktion));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('createAktion', () => {
    it('should successfully insert a aktion', async () => {
      mockAktion.produkt = [{ id: 1 } as Produkt];
      jest.spyOn(repository, 'create').mockReturnValue(mockAktion);
      jest.spyOn(repository, 'save').mockResolvedValue(mockAktion);

      expect(
        await service.createAktion(mockAktion as unknown as AktionDto),
      ).toEqual(mockAktion);
      expect(repository.create).toHaveBeenCalledWith(mockAktion);
      expect(repository.save).toHaveBeenCalledWith(mockAktion);
    });
    it('should successfully insert a aktion for all produkt', async () => {
      const test = {
        ...mockAktion,
      };
      test.produkt = [{ id: 1 } as Produkt];
      jest
        .spyOn(repository.manager, 'transaction')
        .mockImplementation(async (isLevel: any, runIn?: any) => {
          const manager: Partial<EntityManager> = {
            find: jest.fn().mockResolvedValue([{ id: 1 }]),
            create: jest.fn().mockResolvedValue(test),
            save: jest.fn().mockResolvedValue(test),
          };
          try {
            if (runIn) return await runIn(manager);

            return await isLevel(manager);
          } catch (err) {
            console.log(err);
          }
        });

      const item = await service.createAktion(
        mockAktion as unknown as AktionDto,
      );
      expect(item).toEqual(test);
    });
  });

  describe('findAll', () => {
    it('should return an array of aktions', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockAktion]);

      expect(await service.findAll()).toEqual([mockAktion]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOneById', () => {
    it('should get a single aktion', async () => {
      mockAktion.id = 1;
      jest.spyOn(repository, 'findOneOrFail').mockResolvedValue(mockAktion);

      expect(await service.findOneById(1)).toEqual(mockAktion);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { produkt: true },
      });
    });
  });

  describe('updateAktion', () => {
    it('should update a aktion', async () => {
      const updateResult = { raw: '', affected: 1, generatedMaps: null };
      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);

      expect(
        await service.updateAktion(1, mockAktion as unknown as AktionDto),
      ).toEqual(updateResult);
      expect(repository.update).toHaveBeenCalledWith(1, mockAktion);
    });
  });

  describe('deleteAktion', () => {
    it('should delete a aktion', async () => {
      const deleteResult = { affected: 1, raw: '' };
      jest.spyOn(repository, 'delete').mockResolvedValue(deleteResult);

      expect(await service.deleteAktion(1)).toEqual(deleteResult);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});
