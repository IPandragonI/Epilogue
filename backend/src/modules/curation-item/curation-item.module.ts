import { Module } from '@nestjs/common';
import { CurationItemService } from './curation-item.service';
import { CurationItemController } from './curation-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurationItem } from './entities/curation-item.entity';
import { CurationSourceService } from '../curation-source/curation-source.service';
import { CurationSource } from '../curation-source/entities/curation-source.entity';
import { UsersModule } from '../users/users.module';
import { AgencySubscriptionModule } from '../agency-subscription/agency-subscription.module';
import { SubscriptionGuard } from '../../auth/guards/subscription.guard';
import { UsageTrackingInterceptor } from '../../auth/interceptors/usage-tracking.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurationItem, CurationSource]),
    UsersModule,
    AgencySubscriptionModule,
  ],
  exports: [CurationItemService],
  controllers: [CurationItemController],
  providers: [
    CurationItemService,
    CurationSourceService,
    SubscriptionGuard,
    UsageTrackingInterceptor,
  ],
})
export class CurationItemModule {}
