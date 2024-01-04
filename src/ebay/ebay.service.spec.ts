import { Test, TestingModule } from '@nestjs/testing';
import { EbayService } from './ebay.service';
import { Repository } from 'typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EbayService', () => {
  let service: EbayService;
  let comp: Repository<CompanyDataEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EbayService,
        {
          provide: getRepositoryToken(CompanyDataEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<EbayService>(EbayService);
    comp = module.get<Repository<CompanyDataEntity>>(
      getRepositoryToken(CompanyDataEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
