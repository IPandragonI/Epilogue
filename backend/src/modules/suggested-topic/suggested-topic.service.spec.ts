import { Test, TestingModule } from '@nestjs/testing';
import { SuggestedTopicService } from './suggested-topic.service';

describe('SuggestedTopicService', () => {
  let service: SuggestedTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuggestedTopicService],
    }).compile();

    service = module.get<SuggestedTopicService>(SuggestedTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
