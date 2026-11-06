import { getLabs, getModelBySlug } from './api/generated/sdk.gen';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly apiMessage: string | null,
  ) {
    super(`API request failed with status ${status}`);
  }
}

function extractErrorMessage(body: unknown): string | null {
  if (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof body.error === 'string'
  ) {
    return body.error;
  }

  return null;
}

export async function fetchJson<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  if (path === '/labs') {
    const result = await getLabs({ signal });

    if (result.error !== undefined) {
      throw new ApiError(
        result.response?.status ?? 0,
        extractErrorMessage(result.error),
      );
    }

    return result.data as T;
  }

  if (path.startsWith('/models/')) {
    const slug = decodeURIComponent(path.slice('/models/'.length));

    const result = await getModelBySlug({
      path: { slug },
      signal,
    });

    if (result.error !== undefined) {
      throw new ApiError(
        result.response?.status ?? 0,
        extractErrorMessage(result.error),
      );
    }

    return result.data as T;
  }

  throw new Error(`Unsupported API path: ${path}`);
}
