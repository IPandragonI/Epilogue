import { Test, TestingModule } from '@nestjs/testing';
import { ContentNotionController } from './content-notion.controller';
import { ContentNotionService } from './content-notion.service';

describe('ContentNotionController', () => {
  let controller: ContentNotionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentNotionController],
      providers: [ContentNotionService],
    }).compile();

    controller = module.get<ContentNotionController>(ContentNotionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
