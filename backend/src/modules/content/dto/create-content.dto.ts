import { ContentNotionStatusEnum } from "../../content-notion/entities/contentNotionStatus.enum";

export class CreateContentDto {
    title!: string;
    body!: string;
    contentType!: string;
    notionPageId?: string;
    publishedDate?: Date;
    notionSyncStatus?: ContentNotionStatusEnum;
    SEORatio?: number;
}
