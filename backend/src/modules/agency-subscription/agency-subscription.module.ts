import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencySubscription } from './entities/agency-subscription.entity';
import { AgencySubscriptionService } from './agency-subscription.service';
import { AgencySubscriptionController } from './agency-subscription.controller';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgencySubscription]),
    SubscriptionPlanModule,
  ],
  controllers: [AgencySubscriptionController],
  providers: [AgencySubscriptionService],
  exports: [AgencySubscriptionService],
})
export class AgencySubscriptionModule {}
