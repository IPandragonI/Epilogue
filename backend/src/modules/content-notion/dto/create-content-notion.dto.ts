import { ContentNotionStatusEnum } from '../entities/contentNotionStatus.enum';

export class CreateContentNotionDto {
  notion_sync_status!: ContentNotionStatusEnum;
  notion_page_id!: string;
  contentId!: string;
}
