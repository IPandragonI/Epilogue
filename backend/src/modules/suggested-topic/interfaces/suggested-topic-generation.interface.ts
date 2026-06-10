import { PlatformEnum } from '../entities/platform.enum';

export interface SuggestedTopicContextItem {
  title: string;
  summary: string;
  platform?: string;
}

export interface SuggestedTopicGenerationContext {
  curationItems: SuggestedTopicContextItem[];
  contentHistory: SuggestedTopicContextItem[];
  existingTopics: SuggestedTopicContextItem[];
}

export interface GeneratedSuggestedTopic {
  topic: string;
  topicDescription: string;
  recommendedPlatform: PlatformEnum;
}
