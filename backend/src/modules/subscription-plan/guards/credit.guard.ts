import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencySubscription } from '../../agency-subscription/entities/agency-subscription.entity';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';

export type CreditType = 'token' | 'curation' | 'ideaGeneration';

export const CREDIT_TYPE_KEY = 'creditType';
export const CheckCredit =
  (type: CreditType) =>
  (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CREDIT_TYPE_KEY, type, descriptor.value);
    return descriptor;
  };

@Injectable()
export class CreditsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(AgencySubscription)
    private readonly subscriptionRepo: Repository<AgencySubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const creditType = this.reflector.get<CreditType>(
      CREDIT_TYPE_KEY,
      context.getHandler(),
    );

    if (!creditType) return true;

    const request = context.switchToHttp().getRequest();
    const agencyId: string | undefined = request.user?.agencyId;
    const user = request.user;

    if (!agencyId) {
      throw new ForbiddenException('Agency ID is required to check credits.');
    }

    const now = new Date();
    const subscription = await this.subscriptionRepo.findOne({
      where: { agencyId },
      order: { startDate: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No active subscription found for agency ${agencyId}.`,
      );
    }

    if (subscription.endDate && subscription.endDate < now) {
      throw new ForbiddenException('Your subscription has expired.');
    }

    const plan = await this.planRepo.findOne({
      where: { id: subscription.subscriptionPlanId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    if (!user) {
      throw new ForbiddenException('User not authenticated.');
    }

    const quotaMap: Record<
      CreditType,
      { used: number; max: number; label: string }
    > = {
      token: {
        used: user.nbTokenUsedThisMonth,
        max: plan.maxTokenPerMonth,
        label: 'token',
      },
      curation: {
        used: user.nbCurationUsedThisMonth,
        max: plan.maxCurationPerMonth,
        label: 'curation',
      },
      ideaGeneration: {
        used: user.nbIdeaGenerationUsedThisMonth,
        max: plan.maxIdeaGenerationPerMonth,
        label: 'idea generation',
      },
    };

    const { used, max, label } = quotaMap[creditType];

    if (used >= max) {
      throw new ForbiddenException(
        `Monthly ${label} quota reached (${used}/${max}). Please upgrade your plan.`,
      );
    }

    request.creditsContext = { subscription, plan, creditType };
    return true;
  }
}
