import { Test, TestingModule } from '@nestjs/testing';
import { ContentIdeaController } from './content-idea.controller';
import { ContentIdeaService } from './content-idea.service';

describe('ContentIdeaController', () => {
  let controller: ContentIdeaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentIdeaController],
      providers: [ContentIdeaService],
    }).compile();

    controller = module.get<ContentIdeaController>(ContentIdeaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
