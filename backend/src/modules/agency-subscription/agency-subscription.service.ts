import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgencySubscription } from './entities/agency-subscription.entity';
import { CreateAgencySubscriptionDto } from './dto/create-agency-subscription.dto';

@Injectable()
export class AgencySubscriptionService {
  constructor(
    @InjectRepository(AgencySubscription)
    private readonly subscriptionRepository: Repository<AgencySubscription>,
  ) {}

  findActiveByAgency(agencyId: string): Promise<AgencySubscription | null> {
    return this.subscriptionRepository.findOne({
      where: { agencyId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  findAllByAgency(agencyId: string): Promise<AgencySubscription[]> {
    return this.subscriptionRepository.find({
      where: { agencyId },
      order: { createdAt: 'DESC' },
    });
  }

  async subscribe(dto: CreateAgencySubscriptionDto): Promise<AgencySubscription> {
    return this.subscribeWithSession({ ...dto, stripeSessionId: null });
  }

  async subscribeWithSession(dto: CreateAgencySubscriptionDto & { stripeSessionId: string | null }): Promise<AgencySubscription> {
    await this.subscriptionRepository.update(
      { agencyId: dto.agencyId, isActive: true },
      { isActive: false, endDate: new Date() },
    );

    const subscription = this.subscriptionRepository.create({
      agencyId: dto.agencyId,
      subscriptionPlanId: dto.subscriptionPlanId,
      stripeSessionId: dto.stripeSessionId,
      isActive: true,
      startDate: new Date(),
      endDate: null,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    return this.subscriptionRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['subscriptionPlan'],
    });
  }

  changePlan(agencyId: string, subscriptionPlanId: string): Promise<AgencySubscription> {
    return this.subscribe({ agencyId, subscriptionPlanId });
  }

  async cancel(agencyId: string): Promise<void> {
    const active = await this.findActiveByAgency(agencyId);
    if (!active) throw new NotFoundException('Aucun abonnement actif pour cette agence');
    await this.subscriptionRepository.update(active.id, {
      isActive: false,
      endDate: new Date(),
    });
  }
}
