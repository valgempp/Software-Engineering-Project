import { Router } from 'express';
import type { DataSource } from 'typeorm';
import { LLMModel } from './entities/index.js';

export function rankingsRouter(db: DataSource): Router {
  const router = Router();
  router.get('/', async (req, res) => {
    const kind = req.query.kind ?? 'benchmarks';
    if (kind !== 'benchmarks' && kind !== 'community') {
      res.status(400).json({ error: 'kind must be benchmarks or community' });
      return;
    }
    const models = await db
      .getRepository(LLMModel)
      .find({ relations: { lab: true } });
    const rows = models.map((model) => ({
      name: model.name,
      slug: model.slug,
      lab: model.lab.name,
      rank: kind === 'benchmarks' ? model.benchmarkRank : model.communityRank,
      score:
        kind === 'benchmarks' ? model.benchmarkScore : model.communityScore,
      otherRank:
        kind === 'benchmarks' ? model.communityRank : model.benchmarkRank,
    }));
    rows.sort(
      (a, b) =>
        (a.rank ?? Infinity) - (b.rank ?? Infinity) ||
        a.name.localeCompare(b.name) ||
        a.slug.localeCompare(b.slug),
    );
    res.json({ models: rows });
  });
  return router;
}
