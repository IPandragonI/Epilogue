import { Test, TestingModule } from '@nestjs/testing';
import { CurationSourceService } from './curation-source.service';

describe('CurationSourceService', () => {
  let service: CurationSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CurationSourceService],
    }).compile();

    service = module.get<CurationSourceService>(CurationSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
