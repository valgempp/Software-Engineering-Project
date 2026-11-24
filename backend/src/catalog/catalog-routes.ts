import type {
  CatalogModel,
  ErrorResponse,
  LabsResponse,
  ModelDetail,
} from '@aimc/shared';
import { Router } from 'express';
import { z } from 'zod';
import type { Catalog } from './catalog-service.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from './slug.js';

const slugSchema = z.string().max(SLUG_MAX_LENGTH).regex(SLUG_PATTERN);

const newModelSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  lab: z.string().trim().min(1).max(100),
  releaseDate: z.iso.date().nullable().optional(),
});

const labFilterSchema = z.string().trim().min(1).max(100).optional();

export function catalogRouter(catalog: Catalog): Router {
  const router = Router();

  router.get('/labs', async (_req, res) => {
    const body: LabsResponse = { labs: await catalog.listLabs() };
    res.json(body);
  });

  router.get('/models', async (req, res) => {
    const lab = labFilterSchema.safeParse(req.query.lab);
    if (!lab.success) {
      const body: ErrorResponse = { error: 'Invalid lab filter' };
      res.status(400).json(body);
      return;
    }

    const body: CatalogModel[] = await catalog.listModels(lab.data);
    res.json(body);
  });

  router.post('/models', async (req, res) => {
    const input = newModelSchema.safeParse(req.body);
    if (!input.success) {
      const body: ErrorResponse = {
        error: 'Invalid or missing required fields',
      };
      res.status(400).json(body);
      return;
    }

    if (await catalog.modelExists(input.data.slug)) {
      const body: ErrorResponse = { error: 'Model slug already exists' };
      res.status(409).json(body);
      return;
    }

    const created = await catalog.createModel(input.data);
    if (!created) {
      const body: ErrorResponse = { error: 'Lab not found' };
      res.status(404).json(body);
      return;
    }

    const body: CatalogModel = created;
    res.status(201).json(body);
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
