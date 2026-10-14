import { useCallback, useEffect, useState } from 'react';
import { fetchJson } from './api';

export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'success'; data: T };

// Callers remount the component (React `key`) when `path` changes, so the state never shows stale data.
export function useApi<T>(path: string): [ApiState<T>, () => void] {
  const [state, setState] = useState<ApiState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson<T>(path, controller.signal).then(
      (data) => setState({ status: 'success', data }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({ status: 'error', error });
        }
      },
    );
    return () => controller.abort();
  }, [path, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return [state, retry];
}
