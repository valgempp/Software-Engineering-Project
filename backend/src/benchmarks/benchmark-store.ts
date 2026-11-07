import type { DataSource } from 'typeorm';
import {
  Benchmark,
  LLMModel,
  Score,
  Source,
  SourceType,
} from '../entities/index.js';

export interface BenchmarkEntry {
  modelSlug: string;
  benchmarkName: string;
  score: number;
  unit: string;
  source: string | null;
}

export interface BenchmarkInput {
  modelSlug: string;
  benchmarkName: string;
  score: number;
  unit?: string;
  source?: string;
}

export interface BenchmarkStore {
  list(): Promise<BenchmarkEntry[]>;
  modelExists(slug: string): Promise<boolean>;
  create(input: BenchmarkInput): Promise<BenchmarkEntry>;
}

const DEFAULT_SOURCE_NAME = 'Demo dataset (fictional)';
const DEFAULT_SOURCE_URL = '/demo-source.html';

export class TypeOrmBenchmarkStore implements BenchmarkStore {
  constructor(private readonly dataSource: DataSource) {}

  async list(): Promise<BenchmarkEntry[]> {
    const scores = await this.dataSource.getRepository(Score).find({
      relations: { model: true, benchmark: true, source: true },
      order: { modelId: 'ASC', benchmarkId: 'ASC' },
    });

    return scores.map((score) => ({
      modelSlug: score.model.slug,
      benchmarkName: score.benchmark.name,
      score: score.value,
      unit: '%',
      source: score.source.name,
    }));
  }

  modelExists(slug: string): Promise<boolean> {
    return this.dataSource.getRepository(LLMModel).existsBy({ slug });
  }

  async create(input: BenchmarkInput): Promise<BenchmarkEntry> {
    const modelRepo = this.dataSource.getRepository(LLMModel);
    const benchmarkRepo = this.dataSource.getRepository(Benchmark);
    const sourceRepo = this.dataSource.getRepository(Source);
    const scoreRepo = this.dataSource.getRepository(Score);

    const model = await modelRepo.findOneByOrFail({ slug: input.modelSlug });

    const benchmark =
      (await benchmarkRepo.findOneBy({ name: input.benchmarkName })) ??
      (await benchmarkRepo.save(
        benchmarkRepo.create({
          name: input.benchmarkName,
          description: null,
        }),
      ));

    const sourceName = input.source ?? DEFAULT_SOURCE_NAME;
    const source =
      (await sourceRepo.findOneBy({
        name: sourceName,
        type: SourceType.BENCHMARK,
      })) ??
      (await sourceRepo.save(
        sourceRepo.create({
          name: sourceName,
          url: DEFAULT_SOURCE_URL,
          type: SourceType.BENCHMARK,
          lastSuccessAt: new Date(),
          lastError: null,
        }),
      ));

    await scoreRepo.save(
      scoreRepo.create({
        modelId: model.id,
        benchmarkId: benchmark.id,
        source,
        value: input.score,
        fetchedAt: new Date(),
      }),
    );

    return {
      modelSlug: model.slug,
      benchmarkName: benchmark.name,
      score: input.score,
      unit: input.unit ?? '%',
      source: source.name,
    };
  }
}
