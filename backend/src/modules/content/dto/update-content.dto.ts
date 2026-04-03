import { PartialType } from '@nestjs/swagger';
import { CreateContentDto } from './create-content.dto';
import { ContentNotionStatusEnum } from '../entities/contentNotionStatus.enum';

export class UpdateContentDto extends PartialType(CreateContentDto) {
    notionSyncStatus?: ContentNotionStatusEnum;
    notionPageId?: string;
    publishedDate?: Date;
    SEORatio?: number;
}
