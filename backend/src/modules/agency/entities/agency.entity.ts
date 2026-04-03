import { PrimaryGeneratedColumn, Entity, Column } from 'typeorm';

@Entity('agencies')
export class Agency {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 150 })
    name!: string;
}
