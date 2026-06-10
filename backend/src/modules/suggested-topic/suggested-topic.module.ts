import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestedTopicService } from './suggested-topic.service';
import { SuggestedTopicController } from './suggested-topic.controller';
import { SuggestedTopic } from './entities/suggested-topic.entity';
import { UsersModule } from '../users/users.module';
import { AgencySubscriptionModule } from '../agency-subscription/agency-subscription.module';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';
import { AiModule } from '../ai/ai.module';
import { Content } from '../content/entities/content.entity';
import { CurationItem } from '../curation-item/entities/curation-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuggestedTopic, Content, CurationItem]),
    UsersModule,
    AgencySubscriptionModule,
    AiModule,
  ],
  controllers: [SuggestedTopicController],
  providers: [
    SuggestedTopicService,
    SubscriptionGuard,
    UsageTrackingInterceptor,
  ],
})
export class SuggestedTopicModule {}
