import { describe, expect, it } from 'vitest';
import { assertPercentage } from './percentage.js';

describe('assertPercentage', () => {
  it.each([0, 100, 0.01, 99.99, 50, 64.25])('accepts %d', (value) => {
    expect(() => assertPercentage(value)).not.toThrow();
  });

  it.each([
    -0.01,
    100.01,
    -1,
    1000,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('rejects %d', (value) => {
    expect(() => assertPercentage(value)).toThrow(RangeError);
  });
});
