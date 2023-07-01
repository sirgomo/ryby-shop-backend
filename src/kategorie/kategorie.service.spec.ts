import { Test, TestingModule } from '@nestjs/testing';
import { KategorieService } from './kategorie.service';

describe('KategorieService', () => {
  let service: KategorieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KategorieService],
    }).compile();

    service = module.get<KategorieService>(KategorieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
