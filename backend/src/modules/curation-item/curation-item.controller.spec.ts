import { Test, TestingModule } from '@nestjs/testing';
import { CurationItemController } from './curation-item.controller';
import { CurationItemService } from './curation-item.service';

describe('CurationItemController', () => {
  let controller: CurationItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurationItemController],
      providers: [CurationItemService],
    }).compile();

    controller = module.get<CurationItemController>(CurationItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
