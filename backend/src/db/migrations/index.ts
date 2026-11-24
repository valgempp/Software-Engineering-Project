import { SavedComparisons1795520000000 } from './1795520000000-SavedComparisons.js';
import { ModelSuggestions1791940953316 } from './1791940953316-ModelSuggestions.js';
import type { MigrationInterface } from 'typeorm';
import { CatalogSchema1791940953315 } from './1791940953315-CatalogSchema.js';

// Listed explicitly so that the same list works with tsx (sources) and node (build).
export const migrations: (new () => MigrationInterface)[] = [
  CatalogSchema1791940953315,
  ModelSuggestions1791940953316,
  SavedComparisons1795520000000,
];
