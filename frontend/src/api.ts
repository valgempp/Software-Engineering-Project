export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`API request failed with status ${status}`);
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
    throw new ApiError(res.status);
  }
  return (await res.json()) as T;
}
