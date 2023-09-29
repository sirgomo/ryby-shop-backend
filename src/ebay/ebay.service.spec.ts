import { Test, TestingModule } from '@nestjs/testing';
import { EbayService } from './ebay.service';

describe('EbayService', () => {
  let service: EbayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EbayService],
    }).compile();

    service = module.get<EbayService>(EbayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
