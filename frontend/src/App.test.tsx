import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APP_NAME } from './app-name';
import { renderAt } from './test-utils';

describe('App', () => {
  it('shows the application name and a link to the models on the home page', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      APP_NAME,
    );
    expect(
      screen.getByRole('link', { name: 'Browse models' }).getAttribute('href'),
    ).toBe('/models');
  });

  it('only links to features that exist', () => {
    renderAt('/');

    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.textContent).toBe('Models');
  });

  it('shows a not found page for an unknown route', () => {
    renderAt('/does-not-exist');

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Page not found',
    );
  });
});
