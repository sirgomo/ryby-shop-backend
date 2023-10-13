import { Test, TestingModule } from '@nestjs/testing';
import { EbayOffersController } from './ebay-offers.controller';

describe('EbayOffersController', () => {
  let controller: EbayOffersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbayOffersController],
    }).compile();

    controller = module.get<EbayOffersController>(EbayOffersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
