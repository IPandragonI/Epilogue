import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'ID du plan à souscrire' })
  @IsUUID()
  planId!: string;

  @ApiProperty({ description: "ID de l'agence" })
  @IsUUID()
  agencyId!: string;
}
