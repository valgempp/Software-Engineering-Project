/**
 * Benchmark scores are kept only when expressed as a percentage (FR-2.2).
 * Application-level check only: the database column (NUMERIC(5,2)) has no CHECK constraint yet.
 */
export function assertPercentage(value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(
      `Score ${value} is not a percentage: expected a finite number between 0 and 100`,
    );
  }
}
