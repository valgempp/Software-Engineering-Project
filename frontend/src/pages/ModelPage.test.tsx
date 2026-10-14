import type { ModelDetail } from '@aimc/shared';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderAt, stubFetch } from '../test-utils';

const fetchedAt = '2026-10-01T09:00:00.000Z';
const source = { name: 'Demo dataset (fictional)', url: '/demo-source.html' };

const model: ModelDetail = {
  name: 'Aurora Lumen 2 (demo)',
  slug: 'aurora-lumen-2-demo',
  releaseDate: '2026-03-12',
  lab: { name: 'Aurora Demo Lab', logoUrl: '/demo-logos/aurora-demo-lab.png' },
  benchmarkScore: null,
  benchmarkRank: null,
  communityScore: null,
  communityRank: null,
  benchmarks: [
    { benchmark: 'Demo Coding Set', value: 64.25, source, fetchedAt },
    { benchmark: 'Demo Reasoning Set', value: 71.4, source, fetchedAt },
  ],
};

describe('/models/:slug', () => {
  it('loads the model of the URL and shows its details', async () => {
    const fetchMock = stubFetch({ body: model });
    renderAt('/models/aurora-lumen-2-demo');

    expect(screen.getByRole('status').textContent).toBe('Loading model…');
    expect((await screen.findByRole('heading', { level: 1 })).textContent).toBe(
      'Aurora Lumen 2 (demo)',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/models/aurora-lumen-2-demo',
      expect.anything(),
    );
    expect(screen.getByText('Aurora Demo Lab')).toBeTruthy();
    expect(
      document.querySelector('time[datetime="2026-03-12"]'),
    ).not.toBeNull();
  });

  it('shows "Not ranked" and "No votes yet" instead of invented values', async () => {
    stubFetch({ body: model });
    renderAt('/models/aurora-lumen-2-demo');
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getAllByText('Not ranked')).toHaveLength(2);
    expect(screen.getByText('No votes yet')).toBeTruthy();
    expect(screen.queryByText(/0 %/)).toBeNull();
  });

  it('lists each benchmark result with its source link and import date', async () => {
    stubFetch({ body: model });
    renderAt('/models/aurora-lumen-2-demo');
    await screen.findByRole('heading', { level: 1 });

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    const first = within(rows[0] as HTMLElement);
    expect(first.getByText('Demo Coding Set')).toBeTruthy();
    expect(first.getByText('64.25 %')).toBeTruthy();
    const link = first.getByRole('link', { name: source.name });
    expect(link.getAttribute('href')).toBe(source.url);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(
      rows[0]?.querySelector(`time[datetime="${fetchedAt}"]`),
    ).not.toBeNull();
  });

  it('shows the ranks when they exist', async () => {
    stubFetch({ body: { ...model, benchmarkRank: 2, communityRank: 5 } });
    renderAt('/models/aurora-lumen-2-demo');
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByText('#2')).toBeTruthy();
    expect(screen.getByText('#5')).toBeTruthy();
    expect(screen.queryByText('Not ranked')).toBeNull();
  });

  it('handles a model without release date nor benchmark results', async () => {
    stubFetch({ body: { ...model, releaseDate: null, benchmarks: [] } });
    renderAt('/models/aurora-lumen-2-demo');
    await screen.findByRole('heading', { level: 1 });

    expect(screen.getByText('Unknown')).toBeTruthy();
    expect(screen.getByText('No benchmark results available yet')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('offers no voting, commenting or account action', async () => {
    stubFetch({ body: model });
    renderAt('/models/aurora-lumen-2-demo');
    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it.each([404, 400])(
    'shows "Model not found" when the API answers %i',
    async (status) => {
      stubFetch({ status, body: { error: 'Model not found' } });
      renderAt('/models/unknown-model');

      expect(
        (await screen.findByRole('heading', { level: 1 })).textContent,
      ).toBe('Model not found');
    },
  );

  it('shows an error with a retry button for other failures', async () => {
    const fetchMock = stubFetch(
      { status: 500, body: { error: 'Internal server error' } },
      { body: model },
    );
    renderAt('/models/aurora-lumen-2-demo');

    expect((await screen.findByRole('alert')).textContent).toContain(
      'The model could not be loaded.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect((await screen.findByRole('heading', { level: 1 })).textContent).toBe(
      'Aurora Lumen 2 (demo)',
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
