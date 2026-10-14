import type {
  DataSource,
  DeepPartial,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { assertPercentage } from '../../catalog/percentage.js';
import { slugify } from '../../catalog/slug.js';
import {
  Benchmark,
  Lab,
  LLMModel,
  Score,
  Source,
  SourceType,
} from '../../entities/index.js';
import {
  DEMO_IMPORT_DATE,
  demoBenchmarks,
  demoLabs,
  demoModels,
  demoSource,
  type DemoModel,
} from './demo-data.js';

// Not `manager.upsert`: on conflict it also rewrites the generated id, which breaks the foreign keys.
async function saveBy<T extends ObjectLiteral>(
  manager: EntityManager,
  target: EntityTarget<T>,
  where: FindOptionsWhere<NoInfer<T>>,
  values: DeepPartial<NoInfer<T>>,
): Promise<T> {
  const entity =
    (await manager.findOneBy(target, where)) ?? manager.create(target);
  return manager.save(target, manager.merge(target, entity, values));
}

// Idempotent: every row is matched on its natural key, so running it again updates instead of duplicating.
export async function seedDemoData(
  dataSource: DataSource,
  models: DemoModel[] = demoModels,
): Promise<void> {
  // Every score is checked before the first write.
  for (const { value } of models.flatMap((model) => model.scores)) {
    assertPercentage(value);
  }

  await dataSource.transaction(async (manager) => {
    const source = await saveBy(
      manager,
      Source,
      { name: demoSource.name, type: SourceType.BENCHMARK },
      {
        ...demoSource,
        type: SourceType.BENCHMARK,
        lastSuccessAt: DEMO_IMPORT_DATE,
        lastError: null,
      },
    );

    const labs = new Map<string, Lab>();
    for (const lab of demoLabs) {
      labs.set(lab.name, await saveBy(manager, Lab, { name: lab.name }, lab));
    }

    const benchmarks = new Map<string, Benchmark>();
    for (const benchmark of demoBenchmarks) {
      benchmarks.set(
        benchmark.name,
        await saveBy(manager, Benchmark, { name: benchmark.name }, benchmark),
      );
    }

    for (const { lab, scores, ...values } of models) {
      const slug = slugify(values.name);
      const model = await saveBy(
        manager,
        LLMModel,
        { slug },
        { ...values, slug, lab: labs.get(lab) },
      );

      for (const score of scores) {
        // The composite primary key (model, benchmark) lets `save` update an existing score.
        await manager.save(Score, {
          modelId: model.id,
          benchmarkId: benchmarks.get(score.benchmark)?.id,
          source,
          value: score.value,
          fetchedAt: DEMO_IMPORT_DATE,
        });
      }
    }
  });
}
