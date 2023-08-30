import { Test, TestingModule } from '@nestjs/testing';
import { BestellungenService } from './bestellungen.service';

describe('BestellungenService', () => {
  let service: BestellungenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BestellungenService],
    }).compile();

    service = module.get<BestellungenService>(BestellungenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
