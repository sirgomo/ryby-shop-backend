import { Test, TestingModule } from '@nestjs/testing';
import { WarenEingangBuchenController } from './waren-eingang-buchen.controller';

describe('WarenEingangBuchenController', () => {
  let controller: WarenEingangBuchenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarenEingangBuchenController],
    }).compile();

    controller = module.get<WarenEingangBuchenController>(WarenEingangBuchenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
