import { Test, TestingModule } from '@nestjs/testing';
import { EbayController } from './ebay.controller';
import { EbayService } from './ebay.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { Repository } from 'typeorm';

describe('EbayController', () => {
  let controller: EbayController;
  let comp: Repository<CompanyDataEntity>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbayController],
      providers: [
        EbayService,
        {
          provide: getRepositoryToken(CompanyDataEntity),
          useClass: Repository,
        },
      ],
    }).compile();
    comp = module.get<Repository<CompanyDataEntity>>(
      getRepositoryToken(CompanyDataEntity),
    );
    controller = module.get<EbayController>(EbayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
