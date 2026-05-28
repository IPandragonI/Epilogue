import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { UserRole } from './userRole.enum';
import { CloudSpace } from '../../cloud-space/entities/cloud-space.entity';
import { Agency } from '../../agency/entities/agency.entity';

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

  @ManyToOne(() => Agency, (agency) => agency.users, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agencyId' })
  agency: Agency | null;

  @Column({ type: 'int' })
  nbTokenUsedThisMonth!: number;

  @Column({ type: 'int' })
  nbCurationUsedThisMonth!: number;

  @Column({ type: 'int' })
  nbIdeaGenerationUsedThisMonth!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => CloudSpace, { cascade: true })
  @JoinColumn()
  cloudSpace: CloudSpace | null;
}
