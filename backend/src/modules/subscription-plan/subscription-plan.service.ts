import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
  ) {}

  create(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    return this.planRepository.save(dto as SubscriptionPlan);
  }

  findAll(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({ order: { price: 'ASC' } });
  }

  async findOne(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOneBy({ id });
    if (!plan) throw new NotFoundException(`Plan ${id} introuvable`);
    return plan;
  }

  findByInternalName(internalName: string): Promise<SubscriptionPlan | null> {
    return this.planRepository.findOneBy({ internalName });
  }

  async update(id: string, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    await this.findOne(id);
    await this.planRepository.update(id, dto as Partial<SubscriptionPlan>);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.planRepository.delete(id);
  }
}
