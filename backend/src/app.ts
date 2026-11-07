import type { BenchmarkStore } from './benchmarks/benchmark-store.js';
import { benchmarksRouter } from './benchmarks/benchmarks-routes.js';
import type { SuggestionStore } from './suggestions/suggestion-store.js';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';

const openApiDocument = JSON.parse(
  readFileSync(new URL('../openapi.json', import.meta.url), 'utf8'),
) as object;
import express from 'express';
import { suggestionsRouter } from './suggestions/suggestions-routes.js';
import type { HealthResponse } from '@aimc/shared';
import { catalogRouter } from './catalog/catalog-routes.js';
import type { Catalog } from './catalog/catalog-service.js';
import { errorHandler, notFoundHandler } from './errors.js';

export interface AppDependencies {
  catalog: Catalog;
  suggestions?: SuggestionStore;
  benchmarks?: BenchmarkStore;
}

export function createApp({
  catalog,
  suggestions,
  benchmarks,
}: AppDependencies): express.Express {
  const app = express();

  app.use(express.json());

  // Only says that the API process answers: the database is not checked here.
  app.get('/api/health', (_req, res) => {
    const body: HealthResponse = { status: 'ok' };
    res.json(body);
  });

  app.use('/api', catalogRouter(catalog));
  if (suggestions) {
    app.use('/api/model-suggestions', suggestionsRouter(suggestions));
  }
  if (benchmarks) {
    app.use('/api/benchmarks', benchmarksRouter(benchmarks));
  }

  app.get('/api/openapi.json', (_req, res) => {
    res.json(openApiDocument);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
