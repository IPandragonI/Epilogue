import { Test, TestingModule } from '@nestjs/testing';
import { AgencySubscriptionService } from './agency-subscription.service';

describe('AgencySubscriptionService', () => {
  let service: AgencySubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgencySubscriptionService],
    }).compile();

    service = module.get<AgencySubscriptionService>(AgencySubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
