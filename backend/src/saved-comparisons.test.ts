import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Repository } from 'typeorm';
import type { SavedComparison } from './entities/SavedComparison.js';
import { savedComparisonsRouter } from './saved-comparisons.js';
import { errorHandler } from './errors.js';
describe('Saved comparisons CRUD', () => {
  let rows: SavedComparison[];
  let nextId: number;
  beforeEach(() => {
    rows = [];
    nextId = 1;
  });
  const repository = {
    find: () => Promise.resolve(rows),
    findOneBy: ({ id }: { id: number }) =>
      Promise.resolve(rows.find((row) => row.id === id) ?? null),
    create: (input: Omit<SavedComparison, 'id'>) => input,
    save: (input: Omit<SavedComparison, 'id'>) => {
      const row = { ...input, id: nextId++ };
      rows.push(row);
      return Promise.resolve(row);
    },
    update: (id: number, input: Omit<SavedComparison, 'id'>) => {
      const row = rows.find((row) => row.id === id);
      if (row) Object.assign(row, input);
      return Promise.resolve({ affected: row ? 1 : 0 });
    },
    delete: (id: number) => {
      const count = rows.length;
      rows = rows.filter((row) => row.id !== id);
      return Promise.resolve({ affected: count - rows.length });
    },
  } as unknown as Repository<SavedComparison>;
  const catalog = { findModel: () => Promise.resolve(null) };
  const app = express()
    .use(express.json())
    .use('/api/saved-comparisons', savedComparisonsRouter(repository, catalog))
    .use(errorHandler);
  const base = '/api/saved-comparisons';
  it('returns an empty list', async () => {
    const r = await request(app).get(base).expect(200);
    expect(r.body).toEqual([]);
  });
  it.each(['0', '-1', 'a', '1.5', '9007199254740992'])(
    'rejects invalid id %s',
    async (id) => {
      await request(app)
        .get(base + '/' + id)
        .expect(400);
    },
  );
  it.each([
    {},
    { name: 'x', models: ['a'] },
    { name: 'x', models: ['a', 'a'] },
    { name: '', models: ['a', 'b'] },
    { name: 'x', models: ['a', 'b'], id: 9 },
  ])('rejects invalid input', async (input) => {
    await request(app).post(base).send(input).expect(400);
  });
  it('rejects unknown models', async () => {
    await request(app)
      .post(base)
      .send({ name: 'x', models: ['a', 'b'] })
      .expect(404);
  });
  it('returns 404 for absent comparison', async () => {
    await request(app)
      .get(base + '/1')
      .expect(404);
    await request(app)
      .delete(base + '/1')
      .expect(404);
  });
  it('creates, retrieves, replaces and deletes a comparison', async () => {
    const known = {
      findModel: () =>
        Promise.resolve({
          name: 'A',
          slug: 'a',
          lab: { name: 'Lab', logoUrl: null },
          releaseDate: null,
          benchmarks: [],
          benchmarkRank: null,
          benchmarkScore: null,
          communityRank: null,
          communityScore: null,
        }),
    };
    const api = express()
      .use(express.json())
      .use(base, savedComparisonsRouter(repository, known))
      .use(errorHandler);
    const first = { name: 'Selection', models: ['a', 'b'] };
    const created = await request(api).post(base).send(first).expect(201);
    expect(created.body).toEqual({ id: 1, ...first });
    await request(api)
      .get(base + '/1')
      .expect(200, { id: 1, ...first });
    const updated = { name: 'Updated', models: ['b', 'a'] };
    await request(api)
      .put(base + '/1')
      .send(updated)
      .expect(200, { id: 1, ...updated });
    await request(api)
      .get(base + '/1')
      .expect(200, { id: 1, ...updated });
    await request(api)
      .delete(base + '/1')
      .expect(204);
    await request(api)
      .get(base + '/1')
      .expect(404);
    await request(api)
      .put(base + '/1')
      .send(first)
      .expect(404);
    const second = await request(api).post(base).send(first).expect(201);
    expect(second.body).toEqual({ id: 2, ...first });
  });
});
