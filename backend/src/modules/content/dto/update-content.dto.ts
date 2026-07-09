import { PartialType } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ContentStatusEnum } from '../entities/contentStatus.enum';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @IsOptional()
  @IsEnum(ContentStatusEnum)
  status?: ContentStatusEnum;
}