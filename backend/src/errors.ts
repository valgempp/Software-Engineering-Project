import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ErrorResponse } from '@aimc/shared';

export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ErrorResponse = { error: 'Not found' };
  res.status(404).json(body);
};

// Client errors raised by Express middlewares (e.g. invalid JSON) carry a 4xx `status`.
function clientErrorStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null || !('status' in err)) {
    return undefined;
  }
  const { status } = err;
  return typeof status === 'number' && status >= 400 && status < 500
    ? status
    : undefined;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = clientErrorStatus(err);
  if (status !== undefined) {
    const body: ErrorResponse = { error: 'Invalid request' };
    res.status(status).json(body);
    return;
  }

  console.error(err);
  const body: ErrorResponse = { error: 'Internal server error' };
  res.status(500).json(body);
};
