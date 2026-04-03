import { Topic } from "src/modules/topic/entities/topic.entity";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlatformEnum } from './platform.enum';

@Entity('content_ideas')
export class ContentIdea {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @ManyToOne(() => Topic, { nullable: true, eager: true })
  topic?: Topic;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({
    type: 'enum',
    enum: PlatformEnum,
    default: PlatformEnum.LINKEDIN,
  })
  platform!: PlatformEnum;
}
