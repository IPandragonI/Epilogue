import { Test, TestingModule } from '@nestjs/testing';
import { CloudSpaceService } from './cloud-space.service';

describe('CloudSpaceService', () => {
  let service: CloudSpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudSpaceService],
    }).compile();

    service = module.get<CloudSpaceService>(CloudSpaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
