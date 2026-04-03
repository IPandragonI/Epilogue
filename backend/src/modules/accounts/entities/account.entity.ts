import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('accounts')
@Unique(['provider', 'providerAccountId'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  provider: string; // 'google' | 'notion'

  @Column({ type: 'varchar', length: 255 })
  providerAccountId: string;

  @Column({ type: 'text', nullable: true })
  access_token: string | null;

  @Column({ type: 'text', nullable: true })
  refresh_token: string | null;

  @Column({ type: 'bigint', nullable: true })
  expires_at: number | null; // timestamp

  @Column({ type: 'varchar', length: 50, nullable: true })
  token_type: string | null; // 'Bearer'

  @Column({ type: 'text', nullable: true })
  scope: string | null;

  @Column({ type: 'text', nullable: true })
  id_token: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
