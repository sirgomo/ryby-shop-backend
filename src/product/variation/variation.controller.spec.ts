import { Test, TestingModule } from '@nestjs/testing';
import { VariationController } from './variation.controller';

describe('VariationController', () => {
  let controller: VariationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariationController],
    }).compile();

    controller = module.get<VariationController>(VariationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
