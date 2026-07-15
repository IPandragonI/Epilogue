import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

export const CURATION_SOURCE_TYPES = ['PDF', 'URL', 'RSS'] as const;

export class CreateCurationSourceDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsIn(CURATION_SOURCE_TYPES)
  sourceType!: string;

  @ValidateIf((dto) => dto.sourceType !== 'PDF')
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @ValidateIf((dto) => dto.sourceType === 'PDF')
  @IsString()
  @IsNotEmpty()
  sourceUrl!: string;
}
