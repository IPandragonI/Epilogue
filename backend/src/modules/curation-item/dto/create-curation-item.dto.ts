import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCurationSourceDto } from '../../curation-source/dto/create-curation-source.dto';

export class CreateCurationItemDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ValidateNested()
  @Type(() => CreateCurationSourceDto)
  source!: CreateCurationSourceDto;
}
