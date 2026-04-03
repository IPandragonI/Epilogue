import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Content } from '../../content/entities/content.entity';

@Entity('content_seo')
export class ContentSeo {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int' })
  score!: number;

  @Column({ type: 'text' })
  keywords!: string;

  @Column({ type: 'text' })
  review!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @OneToOne(() => Content, (content) => content.id, { cascade: true })
  content!: Content;
}
