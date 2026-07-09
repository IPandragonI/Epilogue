import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UserRole } from './userRole.enum';
import { Agency } from '../../agency/entities/agency.entity';
import { Content } from '../../content/entities/content.entity';
import { SuggestedTopic } from '../../suggested-topic/entities/suggested-topic.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  lastname!: string;

  @Column({ type: 'varchar', length: 100 })
  firstname!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PUBLIC })
  role!: UserRole;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  agencyId: string | null;

  @ManyToOne(() => Agency, (agency) => agency.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'agencyId' })
  agency: Agency | null;

  @OneToMany(() => Content, (content: any) => content.user)
  contents: Content[];

  @OneToMany(() => SuggestedTopic, (suggestedTopic) => suggestedTopic.user)
  suggestedTopics: SuggestedTopic[];

  @Column({ type: 'int', default: 0 })
  nbTokenUsedThisMonth!: number;

  @Column({ type: 'int', default: 0 })
  nbCurationUsedThisMonth!: number;

  @Column({ type: 'int', default: 0 })
  nbIdeaGenerationUsedThisMonth!: number;

  @Column({ type: 'varchar', length: 7, nullable: true })
  usageMonth!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, default: null })
  avatarUrl!: string | null;
}
