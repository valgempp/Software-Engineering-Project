import type { ErrorResponse, LabsResponse, ModelDetail } from '@aimc/shared';
import { Router } from 'express';
import { z } from 'zod';
import type { Catalog } from './catalog-service.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from './slug.js';

const slugSchema = z.string().max(SLUG_MAX_LENGTH).regex(SLUG_PATTERN);

export function catalogRouter(catalog: Catalog): Router {
  const router = Router();

  router.get('/labs', async (_req, res) => {
    const body: LabsResponse = { labs: await catalog.listLabs() };
    res.json(body);
  });

  router.get('/models/:slug', async (req, res) => {
    const slug = slugSchema.safeParse(req.params.slug);
    if (!slug.success) {
      const body: ErrorResponse = { error: 'Invalid model slug' };
      res.status(400).json(body);
      return;
    }

    const model = await catalog.findModel(slug.data);
    if (!model) {
      const body: ErrorResponse = { error: 'Model not found' };
      res.status(404).json(body);
      return;
    }

    const body: ModelDetail = model;
    res.json(body);
  });

  return router;
}
