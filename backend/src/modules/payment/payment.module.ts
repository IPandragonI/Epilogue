import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SubscriptionPlanModule } from '../subscription-plan/subscription-plan.module';
import { AgencySubscriptionModule } from '../agency-subscription/agency-subscription.module';

@Module({
  imports: [SubscriptionPlanModule, AgencySubscriptionModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
