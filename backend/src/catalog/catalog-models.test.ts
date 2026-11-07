import type { CatalogModel } from '@aimc/shared';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../errors.js';
import { catalogRouter } from './catalog-routes.js';
import type { Catalog } from './catalog-service.js';

const LABS = ['OpenAI', 'Anthropic'];

function createTestApp() {
  const models: CatalogModel[] = [
    { name: 'GPT-4o', slug: 'gpt-4o', lab: 'OpenAI', releaseDate: null },
  ];

  const catalog: Catalog = {
    listLabs: () => Promise.resolve([]),
    findModel: () => Promise.resolve(null),
    listModels: (lab) =>
      Promise.resolve(models.filter((model) => !lab || model.lab === lab)),
    modelExists: (slug) =>
      Promise.resolve(models.some((model) => model.slug === slug)),
    createModel: (input) => {
      if (!LABS.includes(input.lab)) {
        return Promise.resolve(null);
      }
      const model = { ...input, releaseDate: input.releaseDate ?? null };
      models.push(model);
      return Promise.resolve(model);
    },
  };

  const app = express();
  app.use(express.json());
  app.use('/api', catalogRouter(catalog));
  app.use(errorHandler);
  return app;
}

const validModel = {
  name: 'Claude Sonnet 4',
  slug: 'claude-sonnet-4',
  lab: 'Anthropic',
  releaseDate: '2025-05-22',
};

describe('GET /api/models', () => {
  it('returns every model of the catalogue', async () => {
    const res = await request(createTestApp()).get('/api/models');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { name: 'GPT-4o', slug: 'gpt-4o', lab: 'OpenAI', releaseDate: null },
    ]);
  });

  it('keeps only the models of the requested lab', async () => {
    const app = createTestApp();
    await request(app).post('/api/models').send(validModel);

    const res = await request(app).get('/api/models?lab=Anthropic');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([validModel]);
  });

  it('rejects an empty lab filter with 400', async () => {
    const res = await request(createTestApp()).get('/api/models?lab=');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid lab filter' });
  });
});

describe('POST /api/models', () => {
  it('creates a model and lists it afterwards', async () => {
    const app = createTestApp();

    const created = await request(app).post('/api/models').send(validModel);
    const list = await request(app).get('/api/models');

    expect(created.status).toBe(201);
    expect(created.body).toEqual(validModel);
    expect(list.body).toContainEqual(validModel);
  });

  it('stores a null release date when it is omitted', async () => {
    const withoutDate = { ...validModel, releaseDate: undefined };

    const res = await request(createTestApp())
      .post('/api/models')
      .send(withoutDate);

    expect(res.status).toBe(201);
    expect((res.body as CatalogModel).releaseDate).toBeNull();
  });

  it.each([
    ['a missing name', { slug: 'x', lab: 'OpenAI' }],
    ['a missing lab', { name: 'X', slug: 'x' }],
    ['a slug with spaces', { ...validModel, slug: 'Claude Sonnet' }],
    ['an invalid release date', { ...validModel, releaseDate: '22/05/2025' }],
  ])('rejects %s with 400', async (_case, body) => {
    const res = await request(createTestApp()).post('/api/models').send(body);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid or missing required fields' });
  });

  it('rejects an existing slug with 409', async () => {
    const res = await request(createTestApp())
      .post('/api/models')
      .send({ ...validModel, slug: 'gpt-4o' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Model slug already exists' });
  });

  it('rejects an unknown lab with 404', async () => {
    const res = await request(createTestApp())
      .post('/api/models')
      .send({ ...validModel, lab: 'Unknown Lab' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Lab not found' });
  });
});
