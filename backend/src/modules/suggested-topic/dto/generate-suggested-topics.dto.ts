import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class GenerateSuggestedTopicsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  terms!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUUID('4', { each: true })
  curationItemIds?: string[];
}
