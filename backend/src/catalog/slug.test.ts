import { describe, expect, it } from 'vitest';
import { SLUG_MAX_LENGTH, SLUG_PATTERN, slugify } from './slug.js';

describe('slugify', () => {
  it.each([
    ['GPT-4o (2024-08-06)', 'gpt-4o-2024-08-06'],
    ['Aurora Lumen 2 (demo)', 'aurora-lumen-2-demo'],
    ['  Café  Model  ', 'cafe-model'],
    ['A/B_C', 'a-b-c'],
  ])('turns %j into %j', (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });

  it('produces slugs accepted by the route validation', () => {
    const slug = slugify(`${'x'.repeat(SLUG_MAX_LENGTH - 1)} y`);

    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH);
    expect(slug).toMatch(SLUG_PATTERN);
  });
});
