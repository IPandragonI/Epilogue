import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly repo: Repository<SubscriptionPlan>,
  ) {}

  async findAll(): Promise<SubscriptionPlan[]> {
    return this.repo.find({ order: { price: 'ASC' } });
  }

  async findOne(id: string): Promise<SubscriptionPlan> {
    const plan = await this.repo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan ${id} not found.`);
    return plan;
  }
}
