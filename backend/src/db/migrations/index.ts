import type { MigrationInterface } from 'typeorm';
import { CatalogSchema1791940953315 } from './1791940953315-CatalogSchema.js';

// Listed explicitly so that the same list works with tsx (sources) and node (build).
export const migrations: (new () => MigrationInterface)[] = [
  CatalogSchema1791940953315,
];
