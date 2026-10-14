import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Lab } from './Lab.js';
import { numericTransformer } from './numeric-transformer.js';
import { Score } from './Score.js';

@Entity({ name: 'models' })
export class LLMModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Lab, (lab) => lab.models, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'lab_id' })
  lab!: Relation<Lab>;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug!: string;

  /** YYYY-MM-DD: TypeORM keeps DATE columns as strings, without time zone shift. */
  @Column({ name: 'release_date', type: 'date', nullable: true })
  releaseDate!: string | null;

  // Scores and ranks are only written by the ranking computation (not implemented yet).
  @Column({
    name: 'community_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  communityScore!: number | null;

  @Column({ name: 'community_rank', type: 'int', nullable: true })
  communityRank!: number | null;

  @Column({
    name: 'benchmark_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  benchmarkScore!: number | null;

  @Column({ name: 'benchmark_rank', type: 'int', nullable: true })
  benchmarkRank!: number | null;

  @OneToMany(() => Score, (score) => score.model)
  scores!: Relation<Score[]>;
}
