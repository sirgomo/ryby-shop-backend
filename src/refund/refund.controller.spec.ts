import { Test, TestingModule } from '@nestjs/testing';
import { RefundController } from './refund.controller';

describe('RefundController', () => {
  let controller: RefundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundController],
    }).compile();

    controller = module.get<RefundController>(RefundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
