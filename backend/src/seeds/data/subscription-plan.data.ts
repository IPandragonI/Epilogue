import { BillingCycleEnum } from '../../modules/subscription-plan/entities/billing-cycle.enum';

export const subscriptionPlanData = () => [
  {
    name: 'Gratuit',
    internalName: 'FREE',
    description:
      'Pour découvrir Épilogue et tester les fonctionnalités essentielles.',
    price: 0,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 10_000,
    maxCurationPerMonth: 20,
    maxIdeaGenerationPerMonth: 10,
  },
  {
    name: 'Starter Mensuel',
    internalName: 'STARTER_MONTHLY',
    description:
      'Idéal pour les petites agences qui veulent scaler leur production de contenu.',
    price: 29,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 100_000,
    maxCurationPerMonth: 100,
    maxIdeaGenerationPerMonth: 50,
  },
  {
    name: 'Starter Annuel',
    internalName: 'STARTER_YEARLY',
    description:
      'Idéal pour les petites agences — 2 mois offerts avec la facturation annuelle.',
    price: 290,
    billingCycle: BillingCycleEnum.YEARLY,
    maxTokenPerMonth: 100_000,
    maxCurationPerMonth: 100,
    maxIdeaGenerationPerMonth: 50,
  },
  {
    name: 'Pro Mensuel',
    internalName: 'PRO_MONTHLY',
    description:
      'Pour les agences qui ont besoin de volume et de puissance IA sans compromis.',
    price: 79,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 500_000,
    maxCurationPerMonth: 500,
    maxIdeaGenerationPerMonth: 200,
  },
  {
    name: 'Pro Annuel',
    internalName: 'PRO_YEARLY',
    description:
      'Pour les agences Pro — 2 mois offerts avec la facturation annuelle.',
    price: 790,
    billingCycle: BillingCycleEnum.YEARLY,
    maxTokenPerMonth: 500_000,
    maxCurationPerMonth: 500,
    maxIdeaGenerationPerMonth: 200,
  },
  {
    name: 'Enterprise',
    internalName: 'ENTERPRISE_MONTHLY',
    description:
      'Ressources illimitées pour les grandes agences et les équipes éditoriales.',
    price: 199,
    billingCycle: BillingCycleEnum.MONTHLY,
    maxTokenPerMonth: 999_999,
    maxCurationPerMonth: 999_999,
    maxIdeaGenerationPerMonth: 999_999,
  },
];
