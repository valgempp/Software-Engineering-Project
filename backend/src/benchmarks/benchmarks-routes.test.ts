import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type {
  BenchmarkEntry,
  BenchmarkId,
  BenchmarkInput,
  BenchmarkStore,
  BenchmarkUpdateInput,
} from './benchmark-store.js';
import { benchmarksRouter } from './benchmarks-routes.js';

const KNOWN_MODELS = new Map<string, number>([
  ['aurora-lumen-2-demo', 1],
  ['borealis-drift-demo', 2],
]);

function createTestApp(initialEntries: BenchmarkEntry[] = []) {
  const app = express();
  const entries: BenchmarkEntry[] = [...initialEntries];
  const benchmarkIds = new Map<string, number>();
  let nextBenchmarkId = 1;

  function toKey(id: BenchmarkId): string {
    return `${id.modelId}-${id.benchmarkId}`;
  }

  const store: BenchmarkStore = {
    list() {
      return Promise.resolve([...entries]);
    },
    findById(id: BenchmarkId) {
      const key = toKey(id);
      return Promise.resolve(entries.find((e) => e.id === key) ?? null);
    },
    modelExists(slug: string) {
      return Promise.resolve(KNOWN_MODELS.has(slug));
    },
    create(input: BenchmarkInput) {
      const modelId = KNOWN_MODELS.get(input.modelSlug) ?? 999;
      let benchmarkId = benchmarkIds.get(input.benchmarkName);
      if (benchmarkId === undefined) {
        benchmarkId = nextBenchmarkId++;
        benchmarkIds.set(input.benchmarkName, benchmarkId);
      }

      const id = `${modelId}-${benchmarkId}`;
      const entry: BenchmarkEntry = {
        id,
        modelSlug: input.modelSlug,
        benchmarkName: input.benchmarkName,
        score: input.score,
        unit: input.unit ?? '%',
        source: input.source ?? 'Demo dataset (fictional)',
      };

      const existingIndex = entries.findIndex((e) => e.id === id);
      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }
      return Promise.resolve(entry);
    },
    update(id: BenchmarkId, input: BenchmarkUpdateInput) {
      const key = toKey(id);
      const existing = entries.find((e) => e.id === key);
      if (!existing) {
        return Promise.resolve(null);
      }

      existing.score = input.score;
      if (input.unit !== undefined) {
        existing.unit = input.unit;
      }
      if (input.source !== undefined) {
        existing.source = input.source;
      }
      return Promise.resolve({ ...existing });
    },
    delete(id: BenchmarkId) {
      const key = toKey(id);
      const index = entries.findIndex((e) => e.id === key);
      if (index === -1) {
        return Promise.resolve(false);
      }
      entries.splice(index, 1);
      return Promise.resolve(true);
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
      id: '1-1',
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
      id: '2-1',
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
        id: '1-1',
        modelSlug: 'aurora-lumen-2-demo',
        benchmarkName: 'Demo Reasoning Set',
        score: 71.4,
        unit: '%',
        source: 'Demo dataset (fictional)',
      },
      {
        id: '2-2',
        modelSlug: 'borealis-drift-demo',
        benchmarkName: 'Demo Coding Set',
        score: 87,
        unit: '%',
        source: 'Demo dataset (fictional)',
      },
    ]);
  });

  it('GET by ID returns a benchmark score', async () => {
    const app = createTestApp();
    await request(app).post('/api/benchmarks').send({
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 71.4,
    });

    const response = await request(app).get('/api/benchmarks/1-1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '1-1',
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 71.4,
      unit: '%',
      source: 'Demo dataset (fictional)',
    });
  });

  it('GET by ID returns 400 for an invalid ID format', async () => {
    const app = createTestApp();

    for (const invalidId of ['abc', '0-1', '1-0', '1', '1-2-3']) {
      const response = await request(app).get(`/api/benchmarks/${invalidId}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid ID' });
    }
  });

  it('GET by ID returns 404 when missing', async () => {
    const response = await request(createTestApp()).get(
      '/api/benchmarks/99-99',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Benchmark not found' });
  });

  it('PUT updates an existing benchmark score', async () => {
    const app = createTestApp();
    await request(app).post('/api/benchmarks').send({
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 71.4,
    });

    const response = await request(app).put('/api/benchmarks/1-1').send({
      score: 82.5,
      unit: '%',
      source: 'Updated benchmark source',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '1-1',
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 82.5,
      unit: '%',
      source: 'Updated benchmark source',
    });
  });

  it('PUT returns 400 for invalid ID or invalid payload', async () => {
    const app = createTestApp();

    const invalidIdRes = await request(app)
      .put('/api/benchmarks/not-an-id')
      .send({ score: 80 });
    expect(invalidIdRes.status).toBe(400);
    expect(invalidIdRes.body).toEqual({ error: 'Invalid ID' });

    for (const payload of [{ score: -1 }, { score: 101 }, {}, { extra: 1 }]) {
      const invalidBodyRes = await request(app)
        .put('/api/benchmarks/1-1')
        .send(payload);
      expect(invalidBodyRes.status).toBe(400);
      expect(invalidBodyRes.body).toEqual({
        error: 'Invalid or missing required fields',
      });
    }
  });

  it('PUT returns 404 when benchmark does not exist', async () => {
    const response = await request(createTestApp())
      .put('/api/benchmarks/99-99')
      .send({ score: 80 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Benchmark not found' });
  });

  it('DELETE removes an existing benchmark score', async () => {
    const app = createTestApp();
    await request(app).post('/api/benchmarks').send({
      modelSlug: 'aurora-lumen-2-demo',
      benchmarkName: 'Demo Reasoning Set',
      score: 71.4,
    });

    const deleteRes = await request(app).delete('/api/benchmarks/1-1');
    expect(deleteRes.status).toBe(204);

    const checkRes = await request(app).get('/api/benchmarks/1-1');
    expect(checkRes.status).toBe(404);
  });

  it('DELETE returns 400 for an invalid ID format', async () => {
    const response = await request(createTestApp()).delete(
      '/api/benchmarks/invalid',
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid ID' });
  });

  it('DELETE returns 404 when benchmark does not exist', async () => {
    const response = await request(createTestApp()).delete(
      '/api/benchmarks/99-99',
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Benchmark not found' });
  });
});
