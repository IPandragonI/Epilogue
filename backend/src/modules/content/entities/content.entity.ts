import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ContentStatusEnum } from "./contentStatus.enum";


@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 100 })
  contentType!: string;

  @Column({
    type: 'enum',
    enum: ContentStatusEnum,
    default: ContentStatusEnum.DRAFT,
  })
  status!: ContentStatusEnum;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedDate?: Date | null;
}
