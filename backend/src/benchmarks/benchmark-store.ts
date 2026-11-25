import type { DataSource } from 'typeorm';
import {
  Benchmark,
  LLMModel,
  Score,
  Source,
  SourceType,
} from '../entities/index.js';

export interface BenchmarkId {
  modelId: number;
  benchmarkId: number;
}

export interface BenchmarkEntry {
  id: string;
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

export interface BenchmarkUpdateInput {
  score: number;
  unit?: string;
  source?: string;
}

export interface BenchmarkStore {
  list(): Promise<BenchmarkEntry[]>;
  findById(id: BenchmarkId): Promise<BenchmarkEntry | null>;
  modelExists(slug: string): Promise<boolean>;
  create(input: BenchmarkInput): Promise<BenchmarkEntry>;
  update(
    id: BenchmarkId,
    input: BenchmarkUpdateInput,
  ): Promise<BenchmarkEntry | null>;
  delete(id: BenchmarkId): Promise<boolean>;
}

const DEFAULT_SOURCE_NAME = 'Demo dataset (fictional)';
const DEFAULT_SOURCE_URL = '/demo-source.html';

function formatBenchmarkId(modelId: number, benchmarkId: number): string {
  return `${modelId}-${benchmarkId}`;
}

function toBenchmarkEntry(score: Score, unit = '%'): BenchmarkEntry {
  return {
    id: formatBenchmarkId(score.modelId, score.benchmarkId),
    modelSlug: score.model.slug,
    benchmarkName: score.benchmark.name,
    score: score.value,
    unit,
    source: score.source.name,
  };
}

export class TypeOrmBenchmarkStore implements BenchmarkStore {
  constructor(private readonly dataSource: DataSource) {}

  private async findOrCreateSource(sourceName: string): Promise<Source> {
    const sourceRepo = this.dataSource.getRepository(Source);
    const existing = await sourceRepo.findOneBy({
      name: sourceName,
      type: SourceType.BENCHMARK,
    });
    if (existing) {
      return existing;
    }

    return sourceRepo.save(
      sourceRepo.create({
        name: sourceName,
        url: DEFAULT_SOURCE_URL,
        type: SourceType.BENCHMARK,
        lastSuccessAt: new Date(),
        lastError: null,
      }),
    );
  }

  async list(): Promise<BenchmarkEntry[]> {
    const scores = await this.dataSource.getRepository(Score).find({
      relations: { model: true, benchmark: true, source: true },
      order: { modelId: 'ASC', benchmarkId: 'ASC' },
    });

    return scores.map((score) => toBenchmarkEntry(score));
  }

  async findById(id: BenchmarkId): Promise<BenchmarkEntry | null> {
    const score = await this.dataSource.getRepository(Score).findOne({
      where: { modelId: id.modelId, benchmarkId: id.benchmarkId },
      relations: { model: true, benchmark: true, source: true },
    });

    return score ? toBenchmarkEntry(score) : null;
  }

  modelExists(slug: string): Promise<boolean> {
    return this.dataSource.getRepository(LLMModel).existsBy({ slug });
  }

  async create(input: BenchmarkInput): Promise<BenchmarkEntry> {
    const modelRepo = this.dataSource.getRepository(LLMModel);
    const benchmarkRepo = this.dataSource.getRepository(Benchmark);
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

    const source = await this.findOrCreateSource(
      input.source ?? DEFAULT_SOURCE_NAME,
    );

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
      id: formatBenchmarkId(model.id, benchmark.id),
      modelSlug: model.slug,
      benchmarkName: benchmark.name,
      score: input.score,
      unit: input.unit ?? '%',
      source: source.name,
    };
  }

  async update(
    id: BenchmarkId,
    input: BenchmarkUpdateInput,
  ): Promise<BenchmarkEntry | null> {
    const scoreRepo = this.dataSource.getRepository(Score);
    const existing = await scoreRepo.findOne({
      where: { modelId: id.modelId, benchmarkId: id.benchmarkId },
      relations: { model: true, benchmark: true, source: true },
    });

    if (!existing) {
      return null;
    }

    existing.value = input.score;
    existing.fetchedAt = new Date();
    if (input.source !== undefined) {
      existing.source = await this.findOrCreateSource(input.source);
    }

    await scoreRepo.save(existing);

    return toBenchmarkEntry(existing, input.unit ?? '%');
  }

  async delete(id: BenchmarkId): Promise<boolean> {
    const result = await this.dataSource.getRepository(Score).delete({
      modelId: id.modelId,
      benchmarkId: id.benchmarkId,
    });
    return (result.affected ?? 0) > 0;
  }
}
