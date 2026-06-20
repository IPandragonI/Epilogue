import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import {
  SUBSCRIPTION_FEATURE_KEY,
  SubscriptionFeatureEnum,
} from '../decorators/subscription.decorator';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class UsageTrackingInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const feature = this.reflector.getAllAndOverride<SubscriptionFeatureEnum>(
      SUBSCRIPTION_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!feature) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(() => {
        if (user?.id) {
          this.usersService.incrementUsage(user.id, feature).catch(() => {
            // Ne pas bloquer la réponse si l'incrément échoue
          });
        }
      }),
    );
  }
}
