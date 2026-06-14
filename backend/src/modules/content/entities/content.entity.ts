import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentStatusEnum } from './contentStatus.enum';
import { PlatformEnum } from '../../content-idea/entities/platform.enum';
import { ContentSeo } from 'src/modules/content-seo/entities/content-seo.entity';
import { ContentNotion } from 'src/modules/content-notion/entities/content-notion.entity';
import { User } from '../../users/entities/user.entity';

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    type: 'enum',
    enum: PlatformEnum,
    default: PlatformEnum.BLOG,
  })
  contentPlatform!: PlatformEnum;

  @Column({
    type: 'enum',
    enum: ContentStatusEnum,
    default: ContentStatusEnum.DRAFT,
  })
  status!: ContentStatusEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedDate?: Date | null;

  @OneToOne(() => ContentSeo, (seo) => seo.content, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  seo!: ContentSeo;

  @OneToOne(() => ContentNotion, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  notion?: ContentNotion | null;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.contents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
