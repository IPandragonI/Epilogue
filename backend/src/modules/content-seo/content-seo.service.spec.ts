import { Test, TestingModule } from '@nestjs/testing';
import { ContentSeoService } from './content-seo.service';

describe('ContentSeoService', () => {
  let service: ContentSeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentSeoService],
    }).compile();

    service = module.get<ContentSeoService>(ContentSeoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
