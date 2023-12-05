import { Test, TestingModule } from '@nestjs/testing';
import { ShopRefundService } from './shop-refund.service';

describe('ShopRefundService', () => {
  let service: ShopRefundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopRefundService],
    }).compile();

    service = module.get<ShopRefundService>(ShopRefundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
