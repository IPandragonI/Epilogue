import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, mergeMap } from 'rxjs';
import {
  SUBSCRIPTION_FEATURE_KEY,
  SubscriptionFeatureEnum,
} from '../decorators/subscription.decorator';
import { UsersService } from '../../modules/users/users.service';
import { getRequestedAmount } from '../utils/subscription-usage.util';

@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const features: SubscriptionFeatureEnum[] | undefined =
      this.reflector.getAllAndOverride(SUBSCRIPTION_FEATURE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!features?.length) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    return next.handle().pipe(
      mergeMap(async (data: unknown) => {
        if (!user?.id) {
          return data;
        }

        const increments = features
          .map((feature) => ({
            feature,
            amount: getRequestedAmount(feature, body),
          }))
          .filter(({ amount }) => amount > 0);

        if (!increments.length) {
          return data;
        }

        await Promise.all(
          increments.map(({ feature, amount }) =>
            this.usersService
              .incrementUsage(user.id, feature, amount)
              .catch(() => {
                // Ne pas bloquer la réponse si l'incrément échoue
              }),
          ),
        );

        const updatedUser = await this.usersService.findOne(user.id);

        return {
          ...(typeof data === 'object' && data !== null ? data : {}),
          nbCurationUsedThisMonth: updatedUser.nbCurationUsedThisMonth,
        };
      }),
    );
  }
}
