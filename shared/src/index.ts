// Types only: this package is never executed, so the backend build does not depend on it at runtime.

export interface HealthResponse {
  status: 'ok';
}

export interface ErrorResponse {
  error: string;
}

export interface ModelSummary {
  name: string;
  slug: string;
}

export interface LabSummary {
  name: string;
  logoUrl: string | null;
  models: ModelSummary[];
}

export interface LabsResponse {
  labs: LabSummary[];
}

export interface BenchmarkResult {
  benchmark: string;
  value: number;
  source: { name: string; url: string };
  /** ISO 8601 date-time of the import that produced this value. */
  fetchedAt: string;
}

export interface ModelDetail {
  name: string;
  slug: string;
  /** ISO 8601 date (YYYY-MM-DD), or null when unknown. */
  releaseDate: string | null;
  lab: { name: string; logoUrl: string | null };
  // Written by the ranking computation only: null until it exists, never a placeholder.
  benchmarkScore: number | null;
  benchmarkRank: number | null;
  communityScore: number | null;
  communityRank: number | null;
  benchmarks: BenchmarkResult[];
}
