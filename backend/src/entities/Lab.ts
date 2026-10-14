import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { LLMModel } from './LLMModel.js';

@Entity({ name: 'labs' })
export class Lab {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @OneToMany(() => LLMModel, (model) => model.lab)
  models!: Relation<LLMModel[]>;
}
