import { Test, TestingModule } from '@nestjs/testing';
import { EbaySoldController } from './ebay-sold.controller';

describe('EbaySoldController', () => {
  let controller: EbaySoldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EbaySoldController],
    }).compile();

    controller = module.get<EbaySoldController>(EbaySoldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
