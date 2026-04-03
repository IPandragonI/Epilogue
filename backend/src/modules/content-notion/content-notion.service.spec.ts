import { Test, TestingModule } from '@nestjs/testing';
import { ContentNotionService } from './content-notion.service';

describe('ContentNotionService', () => {
  let service: ContentNotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentNotionService],
    }).compile();

    service = module.get<ContentNotionService>(ContentNotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
