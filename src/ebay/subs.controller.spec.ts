import { Test, TestingModule } from '@nestjs/testing';
import { SubsController } from './subs.controller';

describe('SubsController', () => {
  let controller: SubsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubsController],
    }).compile();

    controller = module.get<SubsController>(SubsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
