import { Test, TestingModule } from '@nestjs/testing';
import { AgencySubscriptionController } from './agency-subscription.controller';
import { AgencySubscriptionService } from './agency-subscription.service';

describe('AgencySubscriptionController', () => {
  let controller: AgencySubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencySubscriptionController],
      providers: [AgencySubscriptionService],
    }).compile();

    controller = module.get<AgencySubscriptionController>(AgencySubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
