import { Router } from 'express';
import { z } from 'zod';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from '../catalog/slug.js';
import type { BenchmarkId, BenchmarkStore } from './benchmark-store.js';

const benchmarkInputSchema = z
  .object({
    modelSlug: z
      .string()
      .trim()
      .min(1)
      .max(SLUG_MAX_LENGTH)
      .regex(SLUG_PATTERN),
    benchmarkName: z.string().trim().min(1).max(100),
    score: z.number().min(0).max(100),
    unit: z.string().trim().min(1).max(20).optional(),
    source: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

const benchmarkUpdateSchema = z
  .object({
    score: z.number().min(0).max(100),
    unit: z.string().trim().min(1).max(20).optional(),
    source: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

function parseBenchmarkId(
  value: string | string[] | undefined,
): BenchmarkId | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = /^([1-9][0-9]*)-([1-9][0-9]*)$/.exec(value);
  if (!match) {
    return null;
  }
  const modelId = Number(match[1]);
  const benchmarkId = Number(match[2]);
  if (!Number.isSafeInteger(modelId) || !Number.isSafeInteger(benchmarkId)) {
    return null;
  }
  return { modelId, benchmarkId };
}

export function benchmarksRouter(store: BenchmarkStore): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const benchmarks = await store.list();
    res.status(200).json(benchmarks);
  });

  router.get('/:id', async (req, res) => {
    const id = parseBenchmarkId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const benchmark = await store.findById(id);
    if (!benchmark) {
      res.status(404).json({ error: 'Benchmark not found' });
      return;
    }

    res.status(200).json(benchmark);
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

  router.put('/:id', async (req, res) => {
    const id = parseBenchmarkId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const result = benchmarkUpdateSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Invalid or missing required fields',
      });
      return;
    }

    const updated = await store.update(id, result.data);
    if (!updated) {
      res.status(404).json({ error: 'Benchmark not found' });
      return;
    }

    res.status(200).json(updated);
  });

  router.delete('/:id', async (req, res) => {
    const id = parseBenchmarkId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const deleted = await store.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Benchmark not found' });
      return;
    }

    res.status(204).end();
  });

  return router;
}
