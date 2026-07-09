import { SubscriptionFeatureEnum } from '../decorators/subscription.decorator';

/**
 * Détermine la quantité à vérifier/incrémenter pour une feature donnée.
 * - CURATION : nombre de curationItemIds envoyés dans le body
 * - TOKEN : si le coût réel a déjà été calculé (post-génération, stocké sur
 *   request.usageAmounts par le controller), on l'utilise ; sinon (pré-check
 *   côté guard, avant l'appel IA), on ne peut pas connaître le coût exact —
 *   on retourne 1 comme simple garde-fou "quota déjà épuisé ?"
 * - IDEA_GENERATION : 1 unité fixe par appel
 */
export function getRequestedAmount(
  feature: SubscriptionFeatureEnum,
  request: any,
): number {
  if (
    feature === SubscriptionFeatureEnum.CURATION &&
    Array.isArray(request?.body?.curationItemIds)
  ) {
    return request.body.curationItemIds.length;
  }

  if (feature === SubscriptionFeatureEnum.TOKEN) {
    const actual = request?.usageAmounts?.[SubscriptionFeatureEnum.TOKEN];
    if (typeof actual === 'number') return actual;
    return 1;
  }

  return 1;
}