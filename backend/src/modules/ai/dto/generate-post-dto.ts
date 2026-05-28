import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class GeneratePostDto {
  @ApiProperty({
    example: 'LinkedIn',
  })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({
    example: 'Les avantages du télétravail',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Professionnel',
  })
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

  @ApiProperty({
    example: 'Court',
  })
  @IsString()
  @IsIn(['court', 'moyen', 'long'])
  @IsNotEmpty()
  length: string;
}
