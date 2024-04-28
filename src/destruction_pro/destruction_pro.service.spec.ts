import { Test, TestingModule } from '@nestjs/testing';
import { DestructionProService } from './destruction_pro.service';

describe('DestructionProService', () => {
  let service: DestructionProService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DestructionProService],
    }).compile();

    service = module.get<DestructionProService>(DestructionProService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
