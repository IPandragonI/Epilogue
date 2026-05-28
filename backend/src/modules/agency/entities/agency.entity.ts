import { PrimaryGeneratedColumn, Entity, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('agencies')
export class Agency {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    name!: string;

    @OneToMany(() => User, (user) => user.agency)
    users: User[];
}
