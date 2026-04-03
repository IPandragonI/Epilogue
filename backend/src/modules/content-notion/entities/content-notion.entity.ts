import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from '../../content/entities/content.entity';
import { ContentNotionStatusEnum } from './contentNotionStatus.enum';

@Entity('content_notion')
export class ContentNotion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ContentNotionStatusEnum,
    default: ContentNotionStatusEnum.SYNCING,
  })
  notion_sync_status!: ContentNotionStatusEnum;

  @Column({ type: 'varchar', length: 255 })
  notion_page_id!: string;

  @OneToOne(() => Content, (content) => content.id, { cascade: true })
  content!: Content;
}
