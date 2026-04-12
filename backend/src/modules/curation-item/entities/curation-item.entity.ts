import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CurationSource } from '../../curation-source/entities/curation-source.entity';

@Entity('curation_items')
export class CurationItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string;

  @ManyToOne(() => User, { nullable: false, cascade: true })
  user!: User;

  @CreateDateColumn({ type: 'timestamp' })
  lastFetchedAt!: Date;

  @ManyToOne(() => CurationSource, { nullable: true, cascade: true })
  source!: CurationSource;
}
