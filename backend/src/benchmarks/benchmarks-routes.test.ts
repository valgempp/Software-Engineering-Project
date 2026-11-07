import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type {
  BenchmarkEntry,
  BenchmarkInput,
  BenchmarkStore,
} from './benchmark-store.js';
import { benchmarksRouter } from './benchmarks-routes.js';

const KNOWN_MODELS = new Set(['aurora-lumen-2-demo', 'borealis-drift-demo']);

function createTestApp(initialEntries: BenchmarkEntry[] = []) {
  const app = express();
  const entries: BenchmarkEntry[] = [...initialEntries];

  const store: BenchmarkStore = {
    list() {
      return Promise.resolve([...entries]);
    },
    modelExists(slug: string) {
      return Promise.resolve(KNOWN_MODELS.has(slug));
    },
    create(input: BenchmarkInput) {
      const entry: BenchmarkEntry = {
        modelSlug: input.modelSlug,
        benchmarkName: input.benchmarkName,
        score: input.score,
        unit: input.unit ?? '%',
        source: input.source ?? 'Demo dataset (fictional)',
      };
      entries.push(entry);
      return Promise.resolve(entry);
    },
  };

  app.use(express.json());
  app.use('/api/benchmarks', benchmarksRouter(store));
  return app;
}

describe('Benchmarks API', () => {
  it('GET returns an empty array initially', async () => {
    const response = await request(createTestApp()).get('/api/benchmarks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST creates a new benchmark score for an existing model', async () => {
    const response = await request(createTestApp())
      .post('/api/benchmarks')
      .send({
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
        score: 71.4,
        unit: '%',
        source: 'Demo dataset (fictional)',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 71.4,
      unit: '%',
      source: 'Demo dataset (fictional)',
    });
  });

  it('POST applies default unit and source when omitted', async () => {
    const response = await request(createTestApp())
      .post('/api/benchmarks')
      .send({
        modelSlug: 'borealis-drift-demo',
        benchmarkName: 'Demo Coding Set',
        score: 87,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      modelSlug: 'borealis-drift-demo',
      benchmarkName: 'Demo Coding Set',
      score: 87,
      unit: '%',
      source: 'Demo dataset (fictional)',
    });
  });

  it('POST rejects missing required fields with 400', async () => {
    const response = await request(createTestApp())
      .post('/api/benchmarks')
      .send({
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid or missing required fields',
    });
  });

  it('POST rejects non-numeric or out-of-range scores and invalid fields with 400', async () => {
    const app = createTestApp();

    for (const payload of [
      {
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
        score: 'not-a-number',
      },
      {
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
        score: -5,
      },
      {
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
        score: 105,
      },
      {
        modelSlug: 'Invalid_Slug!',
        benchmarkName: 'Demo Reasoning Set',
        score: 80,
      },
      {
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: '   ',
        score: 80,
      },
      {},
    ]) {
      const response = await request(app).post('/api/benchmarks').send(payload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    }
  });

  it('POST returns 404 when the model slug does not exist', async () => {
    const response = await request(createTestApp())
      .post('/api/benchmarks')
      .send({
        modelSlug: 'unknown-model-slug',
        benchmarkName: 'Demo Reasoning Set',
        score: 75,
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Model not found',
    });
  });

  it('GET returns previously created benchmark scores', async () => {
    const app = createTestApp();

    await request(app).post('/api/benchmarks').send({
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 71.4,
    });

    await request(app).post('/api/benchmarks').send({
      modelSlug: 'borealis-drift-demo',
      benchmarkName: 'Demo Coding Set',
      score: 87,
    });

    const response = await request(app).get('/api/benchmarks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual([
      {
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
        score: 71.4,
        unit: '%',
        source: 'Demo dataset (fictional)',
      },
      {
        modelSlug: 'borealis-drift-demo',
        benchmarkName: 'Demo Coding Set',
        score: 87,
        unit: '%',
        source: 'Demo dataset (fictional)',
      },
    ]);
  });
});
