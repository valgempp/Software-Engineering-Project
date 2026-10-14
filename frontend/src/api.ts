import type { ErrorResponse } from '@aimc/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    /** Message of a JSON `ErrorResponse` sent by our API; null for any other body (proxy page, HTML…). */
    readonly apiMessage: string | null,
  ) {
    super(`API request failed with status ${status}`);
  }
}

async function readApiMessage(res: Response): Promise<string | null> {
  try {
    const body = (await res.json()) as Partial<ErrorResponse> | null;
    return typeof body?.error === 'string' ? body.error : null;
  } catch {
    return null;
  }
}

export async function fetchJson<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new ApiError(res.status, await readApiMessage(res));
  }
  return (await res.json()) as T;
}
