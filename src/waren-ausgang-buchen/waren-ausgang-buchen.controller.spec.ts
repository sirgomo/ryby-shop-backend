import { Test, TestingModule } from '@nestjs/testing';
import { WarenAusgangBuchenController } from './waren-ausgang-buchen.controller';

describe('WarenAusgangBuchenController', () => {
  let controller: WarenAusgangBuchenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarenAusgangBuchenController],
    }).compile();

    controller = module.get<WarenAusgangBuchenController>(WarenAusgangBuchenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
