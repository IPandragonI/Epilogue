import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';
import { UserRole } from './userRole.enum';

@Entity('users')
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  lastname: string;

  @Column({ type: 'varchar', length: 100 })
  firstname: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PUBLIC })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
