import { Test, TestingModule } from '@nestjs/testing';
import { ContentSeoController } from './content-seo.controller';
import { ContentSeoService } from './content-seo.service';

describe('ContentSeoController', () => {
  let controller: ContentSeoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentSeoController],
      providers: [ContentSeoService],
    }).compile();

    controller = module.get<ContentSeoController>(ContentSeoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
