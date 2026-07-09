import { SetMetadata } from '@nestjs/common';

export enum SubscriptionFeatureEnum {
  TOKEN = 'TOKEN',
  CURATION = 'CURATION',
  IDEA_GENERATION = 'IDEA_GENERATION',
}

export const SUBSCRIPTION_FEATURE_KEY = 'subscription_feature';

export const SubscriptionFeature = (
  feature: SubscriptionFeatureEnum | SubscriptionFeatureEnum[],
) =>
  SetMetadata(
    SUBSCRIPTION_FEATURE_KEY,
    Array.isArray(feature) ? feature : [feature],
  );
