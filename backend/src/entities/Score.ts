import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { Benchmark } from './Benchmark.js';
import { LLMModel } from './LLMModel.js';
import { numericTransformer } from './numeric-transformer.js';
import { Source } from './Source.js';

// Association class (model, benchmark): one value per pair, from the most recent import.
@Entity({ name: 'scores' })
export class Score {
  @PrimaryColumn({ name: 'model_id', type: 'int' })
  modelId!: number;

  @PrimaryColumn({ name: 'benchmark_id', type: 'int' })
  benchmarkId!: number;

  @ManyToOne(() => LLMModel, (model) => model.scores, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'model_id' })
  model!: Relation<LLMModel>;

  @ManyToOne(() => Benchmark, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'benchmark_id' })
  benchmark!: Relation<Benchmark>;

  @ManyToOne(() => Source, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'source_id' })
  source!: Relation<Source>;

  /** Percentage between 0 and 100, checked before saving. */
  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  value!: number;

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt!: Date;
}
