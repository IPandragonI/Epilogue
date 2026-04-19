import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('cloud_spaces')
export class CloudSpace {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  notionToken!: string;

  @OneToOne(() => User, (user) => user.cloudSpace)
  user?: User;
}
