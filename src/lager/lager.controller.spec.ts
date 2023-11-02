import { Test, TestingModule } from '@nestjs/testing';
import { LagerController } from './lager.controller';

describe('LagerController', () => {
  let controller: LagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LagerController],
    }).compile();

    controller = module.get<LagerController>(LagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
