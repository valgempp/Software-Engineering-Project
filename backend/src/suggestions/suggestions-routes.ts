import { Router } from 'express';
import { z } from 'zod';
import type { SuggestionStore } from './suggestion-store.js';

const suggestionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  provider: z.string().trim().min(1).max(100),
});

export function suggestionsRouter(store: SuggestionStore): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    const suggestions = await store.list();
    res.status(200).json(suggestions);
  });

  router.post('/', async (req, res) => {
    const result = suggestionSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid or missing required fields',
      });
      return;
    }

    const suggestion = await store.create(result.data);
    res.status(201).json(suggestion);
  });

  return router;
}
