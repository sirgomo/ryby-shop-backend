import { Test, TestingModule } from '@nestjs/testing';
import { WarenAusgangBuchenService } from './waren-ausgang-buchen.service';

describe('WarenAusgangBuchenService', () => {
  let service: WarenAusgangBuchenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarenAusgangBuchenService],
    }).compile();

    service = module.get<WarenAusgangBuchenService>(WarenAusgangBuchenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
