import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifySessionDto {
  @ApiProperty({ description: 'ID de la session Stripe Checkout' })
  @IsString()
  sessionId!: string;
}
