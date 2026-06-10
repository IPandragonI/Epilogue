import { Test, TestingModule } from '@nestjs/testing';
import { SuggestedTopicController } from './suggested-topic.controller';
import { SuggestedTopicService } from './suggested-topic.service';

describe('SuggestedTopicController', () => {
  let controller: SuggestedTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuggestedTopicController],
      providers: [SuggestedTopicService],
    }).compile();

    controller = module.get<SuggestedTopicController>(SuggestedTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
