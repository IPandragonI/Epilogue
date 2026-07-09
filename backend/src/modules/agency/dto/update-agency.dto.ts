import { PartialType } from '@nestjs/swagger';
import { CreateAgencyDto } from './create-agency.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAgencyDto extends PartialType(CreateAgencyDto) {
  @IsOptional()
  @IsString()
  notionToken?: string;

  @IsOptional()
  @IsString()
  notionParentPageId?: string;

  @IsOptional()
  notionAutoSync?: boolean;
}
