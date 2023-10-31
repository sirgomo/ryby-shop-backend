import { Test, TestingModule } from '@nestjs/testing';
import { EbayOffersService } from './ebay-offers.service';

describe('EbayOffersService', () => {
  let service: EbayOffersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EbayOffersService],
    }).compile();

    service = module.get<EbayOffersService>(EbayOffersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
