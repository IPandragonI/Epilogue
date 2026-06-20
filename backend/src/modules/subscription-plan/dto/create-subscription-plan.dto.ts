import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString, Min } from 'class-validator';
import { BillingCycleEnum } from '../entities/billing-cycle.enum';

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Starter Mensuel' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'STARTER_MONTHLY' })
  @IsString()
  internalName!: string;

  @ApiProperty({ example: 'Parfait pour les petites agences' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 29 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ enum: BillingCycleEnum })
  @IsEnum(BillingCycleEnum)
  billingCycle!: BillingCycleEnum;

  @ApiProperty({ example: 100000 })
  @IsInt()
  @Min(0)
  maxTokenPerMonth!: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  maxCurationPerMonth!: number;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(0)
  maxIdeaGenerationPerMonth!: number;
}
