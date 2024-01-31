import { Test, TestingModule } from '@nestjs/testing';
import { EbayController } from './ebay.controller';
import { EbayService } from './ebay.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyDataEntity } from 'src/entity/companyDataEntity';
import { Repository } from 'typeorm';
import { LogsEntity } from 'src/entity/logsEntity';
import { LogsService } from 'src/ebay_paypal_logs/logs.service';

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
        {
          provide: getRepositoryToken(LogsEntity),
          useClass: Repository,
        },
        LogsService,
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
