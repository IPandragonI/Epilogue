import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentIdeaService } from './content-idea.service';
import { ContentIdeaController } from './content-idea.controller';
import { ContentIdea } from './entities/content-idea.entity';
import { UsersModule } from '../users/users.module';
import { AgencySubscriptionModule } from '../agency-subscription/agency-subscription.module';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentIdea]),
    UsersModule,
    AgencySubscriptionModule,
  ],
  controllers: [ContentIdeaController],
  providers: [
    ContentIdeaService,
    SubscriptionGuard,
    UsageTrackingInterceptor,
  ],
})
export class ContentIdeaModule {}
