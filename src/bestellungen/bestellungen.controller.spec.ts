import { Test, TestingModule } from '@nestjs/testing';
import { BestellungenController } from './bestellungen.controller';

describe('BestellungenController', () => {
  let controller: BestellungenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BestellungenController],
    }).compile();

    controller = module.get<BestellungenController>(BestellungenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
