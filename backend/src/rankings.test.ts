import express from 'express';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { describe, expect, it } from 'vitest';
import { rankingsRouter } from './rankings.js';

describe('ranking comparison', () => {
  const models = [
    {
      name: 'A',
      slug: 'a',
      lab: { name: 'Lab' },
      communityRank: 1,
      benchmarkRank: null,
      benchmarkScore: null,
      communityScore: 90,
    },
    {
      name: 'B',
      slug: 'b',
      lab: { name: 'Lab' },
      communityRank: 2,
      benchmarkRank: 1,
      benchmarkScore: 80,
      communityScore: 70,
    },
  ];
  const db = {
    getRepository: () => ({ find: async () => models }),
  } as unknown as DataSource;
  const app = express().use('/api/rankings', rankingsRouter(db));
  it('switches rank, score, order and comparison position', async () => {
    const benchmarks = await request(app).get('/api/rankings').expect(200);
    expect(benchmarks.body.models[0]).toMatchObject({
      slug: 'b',
      rank: 1,
      score: 80,
      otherRank: 2,
    });
    const community = await request(app)
      .get('/api/rankings?kind=community')
      .expect(200);
    expect(community.body.models[0]).toMatchObject({
      slug: 'a',
      rank: 1,
      score: 90,
      otherRank: null,
    });
  });
  it('rejects an unknown ranking', async () => {
    await request(app).get('/api/rankings?kind=unknown').expect(400);
  });
});
