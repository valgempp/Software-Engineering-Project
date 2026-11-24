import { Router } from 'express';
import { z } from 'zod';
import type { SuggestionStore } from './suggestion-store.js';

const suggestionSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    provider: z.string().trim().min(1).max(100),
  })
  .strict();

function parseId(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export function suggestionsRouter(store: SuggestionStore): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.status(200).json(await store.list());
  });

  router.get('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const suggestion = await store.findById(id);
    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    res.status(200).json(suggestion);
  });

  router.post('/', async (req, res) => {
    const result = suggestionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid or missing required fields' });
      return;
    }

    const suggestion = await store.create(result.data);
    res.status(201).json(suggestion);
  });

  router.put('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const result = suggestionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid or missing required fields' });
      return;
    }

    const suggestion = await store.update(id, result.data);
    if (!suggestion) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    res.status(200).json(suggestion);
  });

  router.delete('/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    const deleted = await store.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Suggestion not found' });
      return;
    }

    res.status(204).end();
  });

  return router;
}
