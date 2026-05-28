import { BillingCycleEnum } from '../../modules/subscription-plan/entities/subscription-plan.entity';
import { DeepPartial } from 'typeorm';
import { SubscriptionPlan } from '../../modules/subscription-plan/entities/subscription-plan.entity';

export const subscriptionPlanData = (): DeepPartial<SubscriptionPlan>[] => [
  {
    name: 'Free',
    internalName: 'free',
    description: 'Access to all features for 30 days.',
    price: 0,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 1000,
    maxCurationPerMonth: 10,
    maxIdeaGenerationPerMonth: 5,
  },
  {
    name: 'Premium',
    internalName: 'premium_monthly',
    description: 'Full access to all features with monthly billing.',
    price: 29.99,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 10000,
    maxCurationPerMonth: 100,
    maxIdeaGenerationPerMonth: 50,
  },
  {
    name: 'Premium',
    internalName: 'premium_annual',
    description: 'Full access to all features with annual billing.',
    price: 299.99,
    billingCycle: BillingCycleEnum.YEARLY,
    maxTokenPerMonth: 10000,
    maxCurationPerMonth: 100,
    maxIdeaGenerationPerMonth: 5,
  },
  {
    name: 'Pro',
    internalName: 'pro_monthly',
    description: 'Access to all features with monthly billing.',
    price: 49.99,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 10000,
    maxCurationPerMonth: 100,
    maxIdeaGenerationPerMonth: 50,
  },
  {
    name: 'Pro',
    internalName: 'pro_annual',
    description: 'Access to all features with annual billing.',
    price: 499.99,
    billingCycle: BillingCycleEnum.YEARLY,
    maxTokenPerMonth: 10000,
    maxCurationPerMonth: 100,
    maxIdeaGenerationPerMonth: 5,
  },
];
