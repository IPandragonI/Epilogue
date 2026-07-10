import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIProviderFactory } from './ai.provider';
import { AIController } from './ai.controller';
import { PromptService } from './prompt.service';
import { ScrappingService } from './scrapping.service';
import { UsersModule } from '../users/users.module';
import { AgencySubscriptionModule } from '../agency-subscription/agency-subscription.module';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';
import { CurationItemModule } from '../curation-item/curation-item.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    CurationItemModule,
    UsersModule,
    AgencySubscriptionModule,
    ContentModule
  ],
  controllers: [AIController],
  providers: [
    AIService,
    AIProviderFactory,
    PromptService,
    ScrappingService,
    SubscriptionGuard,
    UsageTrackingInterceptor,
  ],
  exports: [AIService],
})
export class AiModule {}
