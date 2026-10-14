import type { LabsResponse, ModelDetail } from '@aimc/shared';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderAt, stubFetch } from '../test-utils';

const labs: LabsResponse = {
  labs: [
    {
      name: 'Aurora Demo Lab',
      logoUrl: '/demo-logos/aurora-demo-lab.png',
      models: [
        { name: 'Aurora Atlas (demo)', slug: 'aurora-atlas-demo' },
        { name: 'Aurora Lumen 2 (demo)', slug: 'aurora-lumen-2-demo' },
      ],
    },
    { name: 'Borealis Demo Lab', logoUrl: null, models: [] },
  ],
};

const labCard = (name: string) =>
  screen.getByRole('heading', { name }).closest('li') as HTMLElement;

describe('/models', () => {
  it('shows a loading state, then the labs in the order of the API', async () => {
    const fetchMock = stubFetch({ body: labs });
    renderAt('/models');

    expect(screen.getByRole('status').textContent).toBe('Loading labs…');
    const headings = await screen.findAllByRole('heading', { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Aurora Demo Lab',
      'Borealis Demo Lab',
    ]);
    expect(fetchMock).toHaveBeenCalledWith('/api/labs', expect.anything());
  });

  it('shows the logo of a lab, or its initial when it has none', async () => {
    stubFetch({ body: labs });
    renderAt('/models');
    await screen.findByText('Aurora Demo Lab');

    const logo = labCard('Aurora Demo Lab').querySelector('img');
    expect(logo?.getAttribute('src')).toBe('/demo-logos/aurora-demo-lab.png');
    expect(
      within(labCard('Borealis Demo Lab')).getByTestId('lab-initial')
        .textContent,
    ).toBe('B');
  });

  it('links each model to its page, in the order of the API', async () => {
    stubFetch({ body: labs });
    renderAt('/models');
    await screen.findByText('Aurora Demo Lab');

    const links = within(labCard('Aurora Demo Lab')).getAllByRole('link');
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Aurora Atlas (demo)', '/models/aurora-atlas-demo'],
      ['Aurora Lumen 2 (demo)', '/models/aurora-lumen-2-demo'],
    ]);
  });

  it('says when a lab has no models', async () => {
    stubFetch({ body: labs });
    renderAt('/models');

    await screen.findByText('Aurora Demo Lab');
    expect(
      within(labCard('Borealis Demo Lab')).getByText('No models available yet'),
    ).toBeTruthy();
  });

  it('says when there are no labs', async () => {
    stubFetch({ body: { labs: [] } });
    renderAt('/models');

    expect(await screen.findByText('No labs available yet')).toBeTruthy();
  });

  it('shows an error with a retry button that loads the labs again', async () => {
    const fetchMock = stubFetch(
      { status: 500, body: { error: 'Internal server error' } },
      { body: labs },
    );
    renderAt('/models');

    expect((await screen.findByRole('alert')).textContent).toContain(
      'The labs could not be loaded.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Aurora Demo Lab')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows a network failure as a loading error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    renderAt('/models');

    expect((await screen.findByRole('alert')).textContent).toContain(
      'The labs could not be loaded.',
    );
    expect(screen.queryByText('No labs available yet')).toBeNull();
  });

  it('opens the model page when a model is clicked', async () => {
    const model: ModelDetail = {
      name: 'Aurora Atlas (demo)',
      slug: 'aurora-atlas-demo',
      releaseDate: null,
      lab: { name: 'Aurora Demo Lab', logoUrl: null },
      benchmarkScore: null,
      benchmarkRank: null,
      communityScore: null,
      communityRank: null,
      benchmarks: [],
    };
    stubFetch({ body: labs }, { body: model });
    renderAt('/models');

    fireEvent.click(
      await screen.findByRole('link', { name: 'Aurora Atlas (demo)' }),
    );

    expect((await screen.findByRole('heading', { level: 1 })).textContent).toBe(
      'Aurora Atlas (demo)',
    );
  });
});
