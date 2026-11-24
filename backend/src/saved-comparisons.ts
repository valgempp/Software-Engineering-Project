import { Router } from 'express';
import { z } from 'zod';
import type { Repository } from 'typeorm';
import type { Catalog } from './catalog/catalog-service.js';
import { SLUG_PATTERN } from './catalog/slug.js';
import { SavedComparison } from './entities/SavedComparison.js';

const inputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    models: z
      .array(z.string().max(120).regex(SLUG_PATTERN))
      .min(2)
      .max(10)
      .refine((models) => new Set(models).size === models.length),
  })
  .strict();

export function savedComparisonsRouter(
  repository: Repository<SavedComparison>,
  catalog: Pick<Catalog, 'findModel'>,
): Router {
  const router = Router();
  router.param('id', (req, res, next, id: string) => {
    if (!/^[1-9][0-9]*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      res.status(400).json({ error: 'Invalid comparison ID' });
      return;
    }
    next();
  });
  router.get('/', async (_req, res) => {
    res.json(await repository.find({ order: { id: 'ASC' } }));
  });
  router.get('/:id', async (req, res) => {
    const comparison = await repository.findOneBy({
      id: Number(req.params.id),
    });
    if (!comparison) {
      res.status(404).json({ error: 'Comparison not found' });
      return;
    }
    res.json(comparison);
  });
  for (const method of ['post', 'put'] as const) {
    router[method]<{ id: string }>(
      method === 'post' ? '/' : '/:id',
      async (req, res) => {
        const input = inputSchema.safeParse(req.body);
        if (!input.success) {
          res
            .status(400)
            .json({ error: 'Provide a name and 2 to 10 distinct model slugs' });
          return;
        }
        const models = await Promise.all(
          input.data.models.map((slug) => catalog.findModel(slug)),
        );
        if (models.includes(null)) {
          res.status(404).json({ error: 'Model not found' });
          return;
        }
        if (method === 'post') {
          const created = await repository.save(repository.create(input.data));
          res
            .location('/api/saved-comparisons/' + created.id)
            .status(201)
            .json(created);
          return;
        }
        const result = await repository.update(
          Number(req.params.id),
          input.data,
        );
        if (!result.affected) {
          res.status(404).json({ error: 'Comparison not found' });
          return;
        }
        res.json({ id: Number(req.params.id), ...input.data });
      },
    );
  }
  router.delete('/:id', async (req, res) => {
    const result = await repository.delete(Number(req.params.id));
    if (!result.affected) {
      res.status(404).json({ error: 'Comparison not found' });
      return;
    }
    res.status(204).end();
  });
  return router;
}
