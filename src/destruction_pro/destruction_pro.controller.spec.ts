import { Test, TestingModule } from '@nestjs/testing';
import { DestructionProController } from './destruction_pro.controller';

describe('DestructionProController', () => {
  let controller: DestructionProController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DestructionProController],
    }).compile();

    controller = module.get<DestructionProController>(DestructionProController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
