import type {
  CatalogModel,
  LabSummary,
  ModelDetail,
  NewModelInput,
} from '@aimc/shared';
import type { DataSource } from 'typeorm';
import { Lab, LLMModel } from '../entities/index.js';

export interface Catalog {
  listLabs(): Promise<LabSummary[]>;
  findModel(slug: string): Promise<ModelDetail | null>;
  listModels(lab?: string): Promise<CatalogModel[]>;
  modelExists(slug: string): Promise<boolean>;
  /** Resolves to null when the lab does not exist: a model is never created without its lab. */
  createModel(input: NewModelInput): Promise<CatalogModel | null>;
}

// Sorted in code rather than by PostgreSQL: the result does not depend on the database collation.
const collator = new Intl.Collator('en', {
  sensitivity: 'base',
  numeric: true,
});
const byName = (a: { name: string }, b: { name: string }) =>
  collator.compare(a.name, b.name);

export class CatalogService implements Catalog {
  constructor(private readonly dataSource: DataSource) {}

  async listLabs(): Promise<LabSummary[]> {
    const labs = await this.dataSource
      .getRepository(Lab)
      .find({ relations: { models: true } });

    return labs.sort(byName).map((lab) => ({
      name: lab.name,
      logoUrl: lab.logoUrl,
      models: lab.models.sort(byName).map(({ name, slug }) => ({ name, slug })),
    }));
  }

  async listModels(lab?: string): Promise<CatalogModel[]> {
    const models = await this.dataSource.getRepository(LLMModel).find({
      where: lab ? { lab: { name: lab } } : {},
      relations: { lab: true },
    });

    return models.sort(byName).map(toCatalogModel);
  }

  modelExists(slug: string): Promise<boolean> {
    return this.dataSource.getRepository(LLMModel).existsBy({ slug });
  }

  async createModel(input: NewModelInput): Promise<CatalogModel | null> {
    const lab = await this.dataSource
      .getRepository(Lab)
      .findOneBy({ name: input.lab });
    if (!lab) {
      return null;
    }

    const repo = this.dataSource.getRepository(LLMModel);
    const model = await repo.save(
      repo.create({
        name: input.name,
        slug: input.slug,
        releaseDate: input.releaseDate ?? null,
        lab,
      }),
    );
    return toCatalogModel(model);
  }

  async findModel(slug: string): Promise<ModelDetail | null> {
    const model = await this.dataSource.getRepository(LLMModel).findOne({
      where: { slug },
      relations: { lab: true, scores: { benchmark: true, source: true } },
    });
    if (!model) {
      return null;
    }

    return {
      name: model.name,
      slug: model.slug,
      releaseDate: model.releaseDate,
      lab: { name: model.lab.name, logoUrl: model.lab.logoUrl },
      benchmarkScore: model.benchmarkScore,
      benchmarkRank: model.benchmarkRank,
      communityScore: model.communityScore,
      communityRank: model.communityRank,
      benchmarks: model.scores
        .map((score) => ({
          benchmark: score.benchmark.name,
          value: score.value,
          source: { name: score.source.name, url: score.source.url },
          fetchedAt: score.fetchedAt.toISOString(),
        }))
        .sort((a, b) => collator.compare(a.benchmark, b.benchmark)),
    };
  }
}

function toCatalogModel(model: LLMModel): CatalogModel {
  return {
    name: model.name,
    slug: model.slug,
    lab: model.lab.name,
    releaseDate: model.releaseDate,
  };
}
