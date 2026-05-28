import { Controller, Get, Param } from '@nestjs/common';
import { SubscriptionPlanService } from './subscription-plan.service';

@Controller('subscription-plan')
export class SubscriptionPlanController {
  constructor(private readonly subscriptionPlanService: SubscriptionPlanService) {}

  @Get()
  findAll() {
    return this.subscriptionPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionPlanService.findOne(id);
  }
}
