import express from 'express';
import request from 'supertest';
import { it, expect } from 'vitest';
import { comparisonsRouter } from './comparisons.js';
const app = express().use(
  '/api/comparisons',
  comparisonsRouter({
    findModel: (slug) =>
      Promise.resolve(
        slug === 'unknown'
          ? null
          : {
              name: slug,
              slug,
              lab: { name: 'Lab', logoUrl: null },
              releaseDate: null,
              benchmarkRank: null,
              communityRank: null,
              benchmarkScore: null,
              communityScore: null,
              benchmarks: [],
            },
      ),
  }),
);
it.each(['', 'a', 'a,a', 'a,B'])(
  'rejects invalid selection %s',
  async (models) => {
    await request(app).get('/api/comparisons').query({ models }).expect(400);
  },
);
it('rejects an unknown model', async () => {
  await request(app).get('/api/comparisons?models=a,unknown').expect(404);
});
it('preserves selection order and reports missing measurements as an empty list', async () => {
  const result = await request(app)
    .get('/api/comparisons?models=b,a')
    .expect(200);
  expect(result.body).toEqual({
    models: ['b', 'a'].map((slug) => ({
      slug,
      name: slug,
      lab: 'Lab',
      releaseDate: null,
      benchmarks: [],
    })),
  });
});
