import express from 'express';
import type { HealthResponse } from '@aimc/shared';
import { catalogRouter } from './catalog/catalog-routes.js';
import type { Catalog } from './catalog/catalog-service.js';
import { errorHandler, notFoundHandler } from './errors.js';

export interface AppDependencies {
  catalog: Catalog;
}

export function createApp({ catalog }: AppDependencies): express.Express {
  const app = express();

  app.use(express.json());

  // Only says that the API process answers: the database is not checked here.
  app.get('/api/health', (_req, res) => {
    const body: HealthResponse = { status: 'ok' };
    res.json(body);
  });

  app.use('/api', catalogRouter(catalog));

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
