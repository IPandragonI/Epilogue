import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  SUBSCRIPTION_FEATURE_KEY,
  SubscriptionFeatureEnum,
} from '../decorators/subscription.decorator';
import { AgencySubscriptionService } from '../../modules/agency-subscription/agency-subscription.service';
import { UsersService } from '../../modules/users/users.service';
import { getRequestedAmount } from '../utils/subscription-usage.util';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly agencySubscriptionService: AgencySubscriptionService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const features = this.reflector.getAllAndOverride<SubscriptionFeatureEnum[]>(
      SUBSCRIPTION_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!features?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    const agencyId =
      user.agencyId ?? (await this.usersService.findOne(user.id)).agencyId;

    if (!agencyId) {
      throw new ForbiddenException('Aucune agence associée à ce compte.');
    }

    const subscription =
      await this.agencySubscriptionService.findActiveByAgency(agencyId);

    if (!subscription) {
      throw new ForbiddenException(
        'Aucun abonnement actif. Veuillez souscrire à un plan pour utiliser cette fonctionnalité.',
      );
    }

    const { subscriptionPlan } = subscription;
    const usage = await this.usersService.getAgencyMonthlyUsage(agencyId);

    const limits: Record<
      SubscriptionFeatureEnum,
      { used: number; max: number; label: string }
    > = {
      [SubscriptionFeatureEnum.TOKEN]: {
        used: usage.tokens,
        max: subscriptionPlan.maxTokenPerMonth,
        label: 'tokens IA',
      },
      [SubscriptionFeatureEnum.CURATION]: {
        used: usage.curations,
        max: subscriptionPlan.maxCurationPerMonth,
        label: 'éléments de curation',
      },
      [SubscriptionFeatureEnum.IDEA_GENERATION]: {
        used: usage.ideaGenerations,
        max: subscriptionPlan.maxIdeaGenerationPerMonth,
        label: "générations d'idées",
      },
    };

    for (const feature of features) {
      const amount = getRequestedAmount(feature, request.body);
      if (amount <= 0) continue;

      const { used, max, label } = limits[feature];

      if (used + amount > max) {
        throw new ForbiddenException(
          `Quota mensuel atteint : ${used}/${max} ${label}. Passez à un plan supérieur pour continuer.`,
        );
      }
    }

    return true;
  }
}