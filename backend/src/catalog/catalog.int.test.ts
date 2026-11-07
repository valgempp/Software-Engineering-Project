import type { CatalogModel, LabsResponse } from '@aimc/shared';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createDataSource } from '../db/data-source.js';
import { seedDemoData } from '../db/seed/seed-demo-data.js';
import { Benchmark, Lab, LLMModel, Score, Source } from '../entities/index.js';
import { CatalogService } from './catalog-service.js';

// Runs against a throwaway PostgreSQL 17 container: requires Docker.
let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17-alpine').start();
  dataSource = await createDataSource({
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    username: container.getUsername(),
    password: container.getPassword(),
  }).initialize();
});

afterAll(async () => {
  await dataSource?.destroy();
  await container?.stop();
});

const api = () =>
  request(createApp({ catalog: new CatalogService(dataSource) }));

async function countRows() {
  return {
    labs: await dataSource.getRepository(Lab).count(),
    models: await dataSource.getRepository(LLMModel).count(),
    benchmarks: await dataSource.getRepository(Benchmark).count(),
    sources: await dataSource.getRepository(Source).count(),
    scores: await dataSource.getRepository(Score).count(),
  };
}

describe('catalogue on PostgreSQL', () => {
  it('creates the schema with the migrations only, matching the entities', async () => {
    const applied = await dataSource.runMigrations({ transaction: 'all' });

    expect(applied.map((m) => m.name)).toEqual(['CatalogSchema1791940953315']);
    expect(await dataSource.showMigrations()).toBe(false);
    const pending = await dataSource.driver.createSchemaBuilder().log();
    expect(pending.upQueries).toEqual([]);
  });

  it('seeds the demo data and does not duplicate it when run again', async () => {
    await seedDemoData(dataSource);
    const first = await countRows();
    await seedDemoData(dataSource);

    expect(first).toEqual({
      labs: 3,
      models: 4,
      benchmarks: 2,
      sources: 1,
      scores: 5,
    });
    expect(await countRows()).toEqual(first);
  });

  it('rejects an invalid score before writing anything', async () => {
    const before = await countRows();
    const invalid = [
      {
        lab: 'Aurora Demo Lab',
        name: 'Invalid Score Model (demo)',
        releaseDate: null,
        scores: [{ benchmark: 'Demo Coding Set', value: 100.5 }],
      },
    ];

    await expect(seedDemoData(dataSource, invalid)).rejects.toThrow(RangeError);
    expect(await countRows()).toEqual(before);
  });

  it('leaves the aggregated scores and ranks empty', async () => {
    const models = await dataSource.getRepository(LLMModel).find();

    for (const model of models) {
      expect(model).toMatchObject({
        benchmarkScore: null,
        benchmarkRank: null,
        communityScore: null,
        communityRank: null,
      });
    }
  });

  it('GET /api/labs lists labs and models in alphabetical order', async () => {
    const res = await api().get('/api/labs');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      labs: [
        {
          name: 'Aurora Demo Lab',
          logoUrl: '/demo-logos/aurora-demo-lab.png',
          models: [
            { name: 'Aurora Atlas (demo)', slug: 'aurora-atlas-demo' },
            { name: 'Aurora Lumen 2 (demo)', slug: 'aurora-lumen-2-demo' },
          ],
        },
        {
          name: 'Borealis Demo Lab',
          logoUrl: null,
          models: [
            { name: 'Borealis Drift (demo)', slug: 'borealis-drift-demo' },
            { name: 'Borealis Ember (demo)', slug: 'borealis-ember-demo' },
          ],
        },
        { name: 'Cirrus Demo Lab', logoUrl: null, models: [] },
      ],
    });
  });

  it('GET /api/models/:slug returns the full model page', async () => {
    const res = await api().get('/api/models/aurora-lumen-2-demo');

    expect(res.status).toBe(200);
    const source = {
      name: 'Demo dataset (fictional)',
      url: '/demo-source.html',
    };
    const fetchedAt = '2026-10-01T09:00:00.000Z';
    expect(res.body).toEqual({
      name: 'Aurora Lumen 2 (demo)',
      slug: 'aurora-lumen-2-demo',
      releaseDate: '2026-03-12',
      lab: {
        name: 'Aurora Demo Lab',
        logoUrl: '/demo-logos/aurora-demo-lab.png',
      },
      benchmarkScore: null,
      benchmarkRank: null,
      communityScore: null,
      communityRank: null,
      benchmarks: [
        { benchmark: 'Demo Coding Set', value: 64.25, source, fetchedAt },
        { benchmark: 'Demo Reasoning Set', value: 71.4, source, fetchedAt },
      ],
    });
  });

  it('GET /api/models/:slug handles a model without date nor benchmarks', async () => {
    const res = await api().get('/api/models/borealis-ember-demo');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ releaseDate: null, benchmarks: [] });
  });

  it('GET /api/models/:slug returns 404 for an unknown slug', async () => {
    const res = await api().get('/api/models/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Model not found' });
  });

  it('GET /api/models lists the models by name, filtered by lab', async () => {
    const all = await api().get('/api/models');
    const borealis = await api().get('/api/models?lab=Borealis Demo Lab');

    expect(all.status).toBe(200);
    const allModels = all.body as CatalogModel[];
    expect(allModels.map((model) => model.slug)).toEqual([
      'aurora-atlas-demo',
      'aurora-lumen-2-demo',
      'borealis-drift-demo',
      'borealis-ember-demo',
    ]);
    expect(allModels[0]).toMatchObject({ lab: 'Aurora Demo Lab' });
    expect(
      (borealis.body as CatalogModel[]).map((model) => model.slug),
    ).toEqual(['borealis-drift-demo', 'borealis-ember-demo']);
  });

  it('POST /api/models stores the model in its lab', async () => {
    const created = await api().post('/api/models').send({
      name: 'Cirrus Nimbus (demo)',
      slug: 'cirrus-nimbus-demo',
      lab: 'Cirrus Demo Lab',
      releaseDate: '2026-09-01',
    });
    const detail = await api().get('/api/models/cirrus-nimbus-demo');
    const unknownLab = await api().post('/api/models').send({
      name: 'Ghost (demo)',
      slug: 'ghost-demo',
      lab: 'Ghost Lab',
    });

    expect(created.status).toBe(201);
    expect(detail.body).toMatchObject({
      releaseDate: '2026-09-01',
      lab: { name: 'Cirrus Demo Lab' },
    });
    expect(unknownLab.status).toBe(404);
    expect(
      await dataSource.getRepository(LLMModel).existsBy({ slug: 'ghost-demo' }),
    ).toBe(false);
  });

  it('refuses to delete a lab that still has models', async () => {
    await expect(
      dataSource.getRepository(Lab).delete({ name: 'Aurora Demo Lab' }),
    ).rejects.toThrow();
  });

  it('sorts without depending on the case of the names', async () => {
    await dataSource.getRepository(Lab).save({ name: 'aardvark Test Lab' });

    const res = await api().get('/api/labs');

    expect((res.body as LabsResponse).labs[0]?.name).toBe('aardvark Test Lab');
  });
});
