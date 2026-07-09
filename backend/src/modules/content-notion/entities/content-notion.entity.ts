import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from '../../content/entities/content.entity';
import { ContentNotionStatusEnum } from './contentNotionStatus.enum';

@Entity('content_notion')
export class ContentNotion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'notion_sync_status',
    type: 'enum',
    enum: ContentNotionStatusEnum,
    default: ContentNotionStatusEnum.SYNCING,
  })
  notionSyncStatus!: ContentNotionStatusEnum;

  @Column({ name: 'notion_page_id', type: 'varchar', length: 255, default: '' })
  notionPageId!: string;

  @OneToOne(() => Content, (content) => content.notion)
  content!: Content;
}
