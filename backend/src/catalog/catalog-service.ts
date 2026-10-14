import type { LabSummary, ModelDetail } from '@aimc/shared';
import type { DataSource } from 'typeorm';
import { Lab, LLMModel } from '../entities/index.js';

export interface Catalog {
  listLabs(): Promise<LabSummary[]>;
  findModel(slug: string): Promise<ModelDetail | null>;
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
