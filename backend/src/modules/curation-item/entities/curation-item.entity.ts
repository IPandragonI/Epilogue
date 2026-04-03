import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('curation_items')
export class CurationItem {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    summary!: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    author?: string;

    @CreateDateColumn({ type: 'timestamp' })
    lastFetchedAt!: Date;

    @OneToOne(() => CurationItem, { cascade: true })
    source!: CurationItem;
}
