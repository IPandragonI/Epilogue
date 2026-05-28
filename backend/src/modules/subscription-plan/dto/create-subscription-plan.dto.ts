import {
  IsString,
  IsNumber,
  IsEnum,
  IsInt,
  IsPositive,
  MinLength,
  Min,
} from 'class-validator';
import { BillingCycleEnum } from '../entities/subscription-plan.entity';

export class CreateSubscriptionPlanDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @IsEnum(BillingCycleEnum)
  billingCycle!: BillingCycleEnum;

  @IsInt()
  @Min(0)
  maxTokenPerMonth!: number;

  @IsInt()
  @Min(0)
  maxCurationPerMonth!: number;

  @IsInt()
  @Min(0)
  maxIdeaGenerationPerMonth!: number;
}
