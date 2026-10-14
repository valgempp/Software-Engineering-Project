import { describe, expect, it } from 'vitest';
import { assertPercentage } from '../../catalog/percentage.js';
import { slugify } from '../../catalog/slug.js';
import {
  demoBenchmarks,
  demoLabs,
  demoModels,
  demoSource,
} from './demo-data.js';

describe('demo data', () => {
  it('only contains percentages between 0 and 100', () => {
    for (const { value } of demoModels.flatMap((m) => m.scores)) {
      expect(() => assertPercentage(value)).not.toThrow();
    }
  });

  it('keeps every model under the 3 benchmarks needed for a rank', () => {
    for (const model of demoModels) {
      expect(model.scores.length).toBeLessThan(3);
    }
  });

  it('labels every lab, model and source as fictional', () => {
    for (const name of [
      ...demoLabs.map((l) => l.name),
      ...demoModels.map((m) => m.name),
      ...demoBenchmarks.map((b) => b.name),
    ]) {
      expect(name).toMatch(/demo/i);
    }
    expect(demoSource.name).toMatch(/fictional/i);
  });

  it('covers the display edge cases', () => {
    const labsWithModels = new Set(demoModels.map((m) => m.lab));

    expect(demoLabs.some((l) => l.logoUrl !== null)).toBe(true);
    expect(demoLabs.some((l) => l.logoUrl === null)).toBe(true);
    expect(demoLabs.some((l) => !labsWithModels.has(l.name))).toBe(true);
    expect(demoModels.some((m) => m.scores.length === 0)).toBe(true);
  });

  it('only references known labs and benchmarks, with unique slugs', () => {
    const labNames = new Set(demoLabs.map((l) => l.name));
    const benchmarkNames = new Set(demoBenchmarks.map((b) => b.name));
    const slugs = demoModels.map((m) => slugify(m.name));

    expect(new Set(slugs).size).toBe(slugs.length);
    for (const model of demoModels) {
      expect(labNames.has(model.lab)).toBe(true);
      for (const score of model.scores) {
        expect(benchmarkNames.has(score.benchmark)).toBe(true);
      }
    }
  });
});
