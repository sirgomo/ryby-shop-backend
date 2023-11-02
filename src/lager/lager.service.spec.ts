import { Test, TestingModule } from '@nestjs/testing';
import { LagerService } from './lager.service';

describe('LagerService', () => {
  let service: LagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LagerService],
    }).compile();

    service = module.get<LagerService>(LagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
