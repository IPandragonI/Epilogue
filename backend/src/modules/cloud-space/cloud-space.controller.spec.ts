import { Test, TestingModule } from '@nestjs/testing';
import { CloudSpaceController } from './cloud-space.controller';
import { CloudSpaceService } from './cloud-space.service';

describe('CloudSpaceController', () => {
  let controller: CloudSpaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CloudSpaceController],
      providers: [CloudSpaceService],
    }).compile();

    controller = module.get<CloudSpaceController>(CloudSpaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
