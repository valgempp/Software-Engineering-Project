import { Router } from 'express';
import { z } from 'zod';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../catalog/slug.js';
import type { BenchmarkStore } from './benchmark-store.js';

const benchmarkInputSchema = z.object({
  modelSlug: z.string().trim().min(1).max(SLUG_MAX_LENGTH).regex(SLUG_PATTERN),
  benchmarkName: z.string().trim().min(1).max(100),
  score: z.number().min(0).max(100),
  unit: z.string().trim().min(1).max(20).optional(),
  source: z.string().trim().min(1).max(100).optional(),
});

export function benchmarksRouter(store: BenchmarkStore): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const benchmarks = await store.list();
    res.status(200).json(benchmarks);
  });

  router.post('/', async (req, res) => {
    const result = benchmarkInputSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid or missing required fields',
      });
      return;
    }

    const exists = await store.modelExists(result.data.modelSlug);
    if (!exists) {
      res.status(404).json({
        error: 'Model not found',
      });
      return;
    }

    const created = await store.create(result.data);
    res.status(201).json(created);
  });

  return router;
}
