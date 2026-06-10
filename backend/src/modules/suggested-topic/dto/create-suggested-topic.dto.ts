import { PlatformEnum } from '../entities/platform.enum';

export class CreateSuggestedTopicDto {
    topic!: string;
    topicDescription!: string;
    recommendedPlatform!: PlatformEnum;
    userId!: string;
}
