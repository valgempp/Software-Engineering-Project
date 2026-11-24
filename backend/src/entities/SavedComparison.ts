import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity({ name: 'saved_comparisons' })
export class SavedComparison {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: 'varchar', length: 100 }) name!: string;
  @Column({ type: 'jsonb' }) models!: string[];
}
