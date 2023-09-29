import { Test, TestingModule } from '@nestjs/testing';
import { EbayController } from './ebay.controller';

describe('EbayController', () => {
  let controller: EbayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbayController],
    }).compile();

    controller = module.get<EbayController>(EbayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
