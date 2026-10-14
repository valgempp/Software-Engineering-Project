import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const SourceType = {
  BENCHMARK: 'BENCHMARK',
  NEWS: 'NEWS',
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];

@Entity({ name: 'sources' })
export class Source {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text' })
  url!: string;

  @Column({
    type: 'enum',
    enum: Object.values(SourceType),
    enumName: 'source_type',
  })
  type!: SourceType;

  @Column({ name: 'last_success_at', type: 'timestamptz', nullable: true })
  lastSuccessAt!: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError!: string | null;
}
