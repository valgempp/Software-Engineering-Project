import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, vi } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

export function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

/** Replaces `fetch` with a stub that answers each call with the next response of the list. */
export function stubFetch(...responses: { status?: number; body: unknown }[]) {
  const fetchMock = vi.fn<typeof fetch>(() => {
    const next = responses.shift();
    if (!next) {
      throw new Error('Unexpected fetch call');
    }
    return Promise.resolve(
      new Response(JSON.stringify(next.body), {
        status: next.status ?? 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
