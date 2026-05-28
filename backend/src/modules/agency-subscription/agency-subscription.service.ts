import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { AgencySubscription } from './entities/agency-subscription.entity';
import { SubscriptionPlan } from '../subscription-plan/entities/subscription-plan.entity';
import { CreateAgencySubscriptionDto } from './dto/create-agency-subscription.dto';

@Injectable()
export class AgencySubscriptionService {
  constructor(
    @InjectRepository(AgencySubscription)
    private readonly subRepo: Repository<AgencySubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async getActive(agencyId: string): Promise<AgencySubscription> {
    const now = new Date();
    const sub = await this.subRepo.findOne({
      where: [
        { agencyId, endDate: IsNull() },
        { agencyId, endDate: LessThanOrEqual(now) },
      ],
      order: { startDate: 'DESC' },
    });
    if (!sub)
      throw new NotFoundException(
        `No active subscription for agency ${agencyId}.`,
      );
    return sub;
  }

  async findAll(): Promise<AgencySubscription[]> {
    return this.subRepo.find();
  }

  async findOne(id: string): Promise<AgencySubscription> {
    const sub = await this.subRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException(`Subscription ${id} not found.`);
    return sub;
  }

  async create(dto: CreateAgencySubscriptionDto): Promise<AgencySubscription> {
    const plan = await this.planRepo.findOne({
      where: { id: dto.subscriptionPlanId },
    });
    if (!plan)
      throw new NotFoundException(`Plan ${dto.subscriptionPlanId} not found.`);

    const sub = this.subRepo.create({
      agencyId: dto.agencyId,
      subscriptionPlanId: dto.subscriptionPlanId,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });
    return this.subRepo.save(sub);
  }

  async remove(agencyId: string): Promise<AgencySubscription> {
    const sub = await this.getActive(agencyId);
    sub.endDate = new Date();
    return this.subRepo.save(sub);
  }

  async changePlan(
    agencyId: string,
    newPlanId: string,
  ): Promise<AgencySubscription> {
    const plan = await this.planRepo.findOne({ where: { id: newPlanId } });
    if (!plan) throw new NotFoundException(`Plan ${newPlanId} not found.`);

    await this.remove(agencyId);

    return this.create({
      agencyId,
      subscriptionPlanId: newPlanId,
    });
  }
}
