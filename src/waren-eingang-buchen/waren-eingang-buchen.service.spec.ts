import { Test, TestingModule } from '@nestjs/testing';
import { WarenEingangBuchenService } from './waren-eingang-buchen.service';

describe('WarenEingangBuchenService', () => {
  let service: WarenEingangBuchenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WarenEingangBuchenService],
    }).compile();

    service = module.get<WarenEingangBuchenService>(WarenEingangBuchenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
