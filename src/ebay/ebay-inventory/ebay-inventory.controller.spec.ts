import { Test, TestingModule } from '@nestjs/testing';
import { EbayInventoryController } from './ebay-inventory.controller';

describe('EbayInventoryController', () => {
  let controller: EbayInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbayInventoryController],
    }).compile();

    controller = module.get<EbayInventoryController>(EbayInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
