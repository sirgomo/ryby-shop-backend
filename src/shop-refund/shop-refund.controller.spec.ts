import { Test, TestingModule } from '@nestjs/testing';
import { ShopRefundController } from './shop-refund.controller';

describe('ShopRefundController', () => {
  let controller: ShopRefundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopRefundController],
    }).compile();

    controller = module.get<ShopRefundController>(ShopRefundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
