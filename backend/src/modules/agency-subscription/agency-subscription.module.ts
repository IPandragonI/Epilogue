import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencySubscriptionService } from './agency-subscription.service';
import { AgencySubscriptionController } from './agency-subscription.controller';
import { AgencySubscription } from './entities/agency-subscription.entity';
import { SubscriptionPlan } from '../subscription-plan/entities/subscription-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AgencySubscription, SubscriptionPlan])],
  controllers: [AgencySubscriptionController],
  providers: [AgencySubscriptionService],
})
export class AgencySubscriptionModule {}
