import { Test, TestingModule } from '@nestjs/testing';
import { CurationItemService } from './curation-item.service';

describe('CurationItemService', () => {
  let service: CurationItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurationItemService],
    }).compile();

    service = module.get<CurationItemService>(CurationItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
