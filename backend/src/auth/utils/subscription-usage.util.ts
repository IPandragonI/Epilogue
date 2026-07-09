import { SubscriptionFeatureEnum } from '../decorators/subscription.decorator';

/**
 * Détermine la quantité consommée pour une feature donnée à partir du body de la requête.
 * - CURATION : 1 unité par curationItemId sélectionné (0 si aucun envoyé)
 * - TOKEN / IDEA_GENERATION : 1 unité fixe par appel
 */
export function getRequestedAmount(
  feature: SubscriptionFeatureEnum,
  body: any,
): number {
  if (
    feature === SubscriptionFeatureEnum.CURATION &&
    Array.isArray(body?.curationItemIds)
  ) {
    return body.curationItemIds.length;
  }
  return 1;
}
