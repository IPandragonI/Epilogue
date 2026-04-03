import { ContentNotionStatusEnum } from "../../content-notion/entities/contentNotionStatus.enum";
import { PlatformEnum } from '../../content-idea/entities/platform.enum';

export class CreateContentDto {
  title!: string;
  body!: string;
  contentPlatform!: PlatformEnum;
  notionPageId?: string;
  publishedDate?: Date;
  notionSyncStatus?: ContentNotionStatusEnum;
  SEORatio?: number;
}
