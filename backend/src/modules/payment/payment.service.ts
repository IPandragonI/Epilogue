import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { SubscriptionPlanService } from '../subscription-plan/subscription-plan.service';
import { AgencySubscriptionService } from '../agency-subscription/agency-subscription.service';
import { AgencySubscription } from '../agency-subscription/entities/agency-subscription.entity';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionPlanService: SubscriptionPlanService,
    private readonly agencySubscriptionService: AgencySubscriptionService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string | null; free: boolean }> {
    const plan = await this.subscriptionPlanService.findOne(dto.planId);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if (Number(plan.price) === 0) {
      await this.agencySubscriptionService.subscribeWithSession({
        agencyId: dto.agencyId,
        subscriptionPlanId: dto.planId,
        stripeSessionId: null,
      });
      return { url: null, free: true };
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: Math.round(Number(plan.price) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        agencyId: dto.agencyId,
        planId: dto.planId,
      },
      success_url: `${frontendUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/pricing?canceled=true`,
    });

    this.logger.log(
      `Session Checkout créée : ${session.id} pour l'agence ${dto.agencyId}`,
    );

    return { url: session.url, free: false };
  }

  async verifyAndActivate(sessionId: string): Promise<{
    subscription: AgencySubscription;
    session: Stripe.Checkout.Session;
  }> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      throw new BadRequestException(
        `Paiement non confirmé (statut : ${session.payment_status})`,
      );
    }

    const { agencyId, planId } = session.metadata ?? {};

    if (!agencyId || !planId) {
      throw new NotFoundException('Métadonnées de session manquantes');
    }

    const existing =
      await this.agencySubscriptionService.findActiveByAgency(agencyId);

    if (existing?.stripeSessionId === sessionId) {
      this.logger.log(`Session ${sessionId} déjà traitée — abonnement existant retourné`);
      return { subscription: existing, session };
    }

    const subscription = await this.agencySubscriptionService.subscribeWithSession({
      agencyId,
      subscriptionPlanId: planId,
      stripeSessionId: sessionId,
    });

    this.logger.log(
      `Abonnement activé pour l'agence ${agencyId} sur le plan ${planId}`,
    );

    return { subscription, session };
  }
}
