import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AgencySubscriptionService } from './agency-subscription.service';
import { CreateAgencySubscriptionDto } from './dto/create-agency-subscription.dto';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { User } from '../users/entities/user.entity';

@Controller('agency-subscription')
export class AgencySubscriptionController {
  constructor(
    private readonly agencySubscriptionService: AgencySubscriptionService,
  ) {}

  @Post()
  create(@Body() dto: CreateAgencySubscriptionDto) {
    return this.agencySubscriptionService.create(dto);
  }

  @Get()
  findAll() {
    return this.agencySubscriptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencySubscriptionService.findOne(id);
  }

  @Get('/active/:agencyId')
  findActive(@Param('agencyId') agencyId: string) {
    return this.agencySubscriptionService.getActive(agencyId);
  }

  @Post('change-plan')
  changePlan(@Body() dto: CreateAgencySubscriptionDto) {
    const { agencyId, subscriptionPlanId } = dto;
    return this.agencySubscriptionService.changePlan(
      agencyId,
      subscriptionPlanId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agencySubscriptionService.remove(id);
  }
}
