import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'model_suggestions' })
export class ModelSuggestion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  provider!: string;
}
