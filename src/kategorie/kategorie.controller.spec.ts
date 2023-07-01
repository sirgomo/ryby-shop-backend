import { Test, TestingModule } from '@nestjs/testing';
import { KategorieController } from './kategorie.controller';

describe('KategorieController', () => {
  let controller: KategorieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KategorieController],
    }).compile();

    controller = module.get<KategorieController>(KategorieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
