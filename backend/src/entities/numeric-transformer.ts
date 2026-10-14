import type { ValueTransformer } from 'typeorm';

// The pg driver returns NUMERIC columns as strings to avoid any precision loss.
export const numericTransformer: ValueTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};
