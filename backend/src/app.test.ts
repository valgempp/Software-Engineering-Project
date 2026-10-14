import type { ModelDetail } from '@aimc/shared';
import express from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app.js';
import type { Catalog } from './catalog/catalog-service.js';
import { errorHandler } from './errors.js';

const model: ModelDetail = {
  name: 'Test Model',
  slug: 'test-model',
  releaseDate: null,
  lab: { name: 'Test Lab', logoUrl: null },
  benchmarkScore: null,
  benchmarkRank: null,
  communityScore: null,
  communityRank: null,
  benchmarks: [],
};

function stubCatalog(overrides: Partial<Catalog> = {}): Catalog {
  return {
    listLabs: () => Promise.resolve([]),
    findModel: () => Promise.resolve(null),
    ...overrides,
  };
}

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(createApp({ catalog: stubCatalog() })).get(
      '/api/health',
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('catalogue routes', () => {
  it('wraps the labs in a labs field', async () => {
    const labs = [{ name: 'Test Lab', logoUrl: null, models: [] }];
    const app = createApp({
      catalog: stubCatalog({ listLabs: () => Promise.resolve(labs) }),
    });

    const res = await request(app).get('/api/labs');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ labs });
  });

  it('returns the model when the slug exists', async () => {
    const findModel = vi.fn(() => Promise.resolve(model));
    const app = createApp({ catalog: stubCatalog({ findModel }) });

    const res = await request(app).get('/api/models/test-model');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(model);
    expect(findModel).toHaveBeenCalledWith('test-model');
  });

  it('returns 404 when the slug is unknown', async () => {
    const res = await request(createApp({ catalog: stubCatalog() })).get(
      '/api/models/unknown-model',
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Model not found' });
  });

  it.each(['Upper-Case', 'double--dash', 'trailing-', 'a'.repeat(121)])(
    'returns 400 without querying the catalogue for the slug %s',
    async (slug) => {
      const findModel = vi.fn(() => Promise.resolve(model));
      const app = createApp({ catalog: stubCatalog({ findModel }) });

      const res = await request(app).get(`/api/models/${slug}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid model slug' });
      expect(findModel).not.toHaveBeenCalled();
    },
  );

  it('returns 500 when the catalogue fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const app = createApp({
      catalog: stubCatalog({
        listLabs: () => Promise.reject(new Error('database down')),
      }),
    });

    const res = await request(app).get('/api/labs');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    consoleError.mockRestore();
  });
});

describe('error handling', () => {
  it('returns a JSON 404 for an unknown API route', async () => {
    const res = await request(createApp({ catalog: stubCatalog() })).get(
      '/api/unknown',
    );

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('returns 400 for a malformed JSON body', async () => {
    const res = await request(createApp({ catalog: stubCatalog() }))
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid request' });
  });

  it('hides the details of an unexpected error behind a 500', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const app = express();
    app.get('/boom', () => {
      throw new Error('secret detail');
    });
    app.use(errorHandler);

    const res = await request(app).get('/boom');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
