import { Test, TestingModule } from '@nestjs/testing';
import { CurationSourceController } from './curation-source.controller';
import { CurationSourceService } from './curation-source.service';

describe('CurationSourceController', () => {
  let controller: CurationSourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurationSourceController],
      providers: [CurationSourceService],
    }).compile();

    controller = module.get<CurationSourceController>(CurationSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
