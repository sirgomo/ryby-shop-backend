import { Test, TestingModule } from '@nestjs/testing';
import { EbaySoldService } from './ebay-sold.service';

describe('EbaySoldService', () => {
  let service: EbaySoldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EbaySoldService],
    }).compile();

    service = module.get<EbaySoldService>(EbaySoldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
