import { ContentNotionStatusEnum } from '../entities/contentNotionStatus.enum';

export class CreateContentNotionDto {
  notionSyncStatus!: ContentNotionStatusEnum;
  notionPageId!: string;
  contentId!: string;
}
