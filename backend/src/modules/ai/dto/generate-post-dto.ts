import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GeneratePostDto {
  @ApiProperty({ example: 'LinkedIn' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ example: 'Les avantages du télétravail' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Professionnel' })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'professionnel',
    'decontracte',
    'inspirant',
    'educatif',
    'humoristique',
  ])
  tone: string;

  @ApiProperty({ example: 'Court' })
  @IsString()
  @IsIn(['court', 'moyen', 'long'])
  @IsNotEmpty()
  length: string;

  @ApiProperty({
    required: false,
    type: [String],
    description: 'IDs des éléments de curation à utiliser comme contexte',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  curationItemIds?: string[];
}
