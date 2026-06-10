import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuggestedTopicService } from './suggested-topic.service';
import { SuggestedTopicController } from './suggested-topic.controller';
import { SuggestedTopic } from './entities/suggested-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuggestedTopic])],
  controllers: [SuggestedTopicController],
  providers: [SuggestedTopicService],
})
export class SuggestedTopicModule {}
