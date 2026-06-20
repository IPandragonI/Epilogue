import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateAgencySubscriptionDto {
  @ApiProperty()
  @IsUUID()
  agencyId!: string;

  @ApiProperty()
  @IsUUID()
  subscriptionPlanId!: string;
}
