import { Test, TestingModule } from '@nestjs/testing';
import { ContentIdeaService } from './content-idea.service';

describe('ContentIdeaService', () => {
  let service: ContentIdeaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentIdeaService],
    }).compile();

    service = module.get<ContentIdeaService>(ContentIdeaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
