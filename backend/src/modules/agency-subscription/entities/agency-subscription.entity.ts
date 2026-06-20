import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Agency } from '../../agency/entities/agency.entity';
import { SubscriptionPlan } from '../../subscription-plan/entities/subscription-plan.entity';

@Entity('agency_subscriptions')
export class AgencySubscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  agencyId!: string;

  @ManyToOne(() => Agency, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agencyId' })
  agency!: Agency;

  @Column({ type: 'uuid' })
  subscriptionPlanId!: string;

  @ManyToOne(() => SubscriptionPlan, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subscriptionPlanId' })
  subscriptionPlan!: SubscriptionPlan;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSessionId!: string | null;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
