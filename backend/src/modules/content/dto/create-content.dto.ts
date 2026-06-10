import { ContentNotionStatusEnum } from "../../content-notion/entities/contentNotionStatus.enum";
import {
  IsDateString,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PlatformEnum } from '../../suggested-topic/entities/platform.enum';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsEnum(PlatformEnum)
  contentPlatform!: PlatformEnum;

  @IsOptional()
  @IsDateString()
  publishedDate?: Date;

  @IsEmpty()
  notionPageId?: string;

  @IsEmpty()
  notionSyncStatus?: ContentNotionStatusEnum;

  @IsEmpty()
  SEORatio?: number;
}