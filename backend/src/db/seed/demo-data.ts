// Fictional data for development and demos only. No real lab or model is named here,
// and every model has fewer than 3 results so that no ranking would apply.

export const DEMO_IMPORT_DATE = new Date('2026-10-01T09:00:00Z');

export const demoSource = {
  name: 'Demo dataset (fictional)',
  url: '/demo-source.html',
};

export const demoBenchmarks = [
  {
    name: 'Demo Reasoning Set',
    description: 'Fictional reasoning benchmark used for development only.',
  },
  {
    name: 'Demo Coding Set',
    description: 'Fictional coding benchmark used for development only.',
  },
];

// Listed out of alphabetical order on purpose: sorting is the job of the API.
export const demoLabs = [
  { name: 'Borealis Demo Lab', logoUrl: null },
  { name: 'Cirrus Demo Lab', logoUrl: null },
  {
    name: 'Aurora Demo Lab',
    logoUrl: '/demo-logos/aurora-demo-lab.png',
  },
];

export interface DemoModel {
  lab: string;
  name: string;
  releaseDate: string | null;
  scores: { benchmark: string; value: number }[];
}

export const demoModels: DemoModel[] = [
  {
    lab: 'Aurora Demo Lab',
    name: 'Aurora Lumen 2 (demo)',
    releaseDate: '2026-03-12',
    scores: [
      { benchmark: 'Demo Reasoning Set', value: 71.4 },
      { benchmark: 'Demo Coding Set', value: 64.25 },
    ],
  },
  {
    lab: 'Aurora Demo Lab',
    name: 'Aurora Atlas (demo)',
    releaseDate: '2025-11-02',
    scores: [{ benchmark: 'Demo Reasoning Set', value: 58.5 }],
  },
  {
    lab: 'Borealis Demo Lab',
    name: 'Borealis Ember (demo)',
    releaseDate: null,
    scores: [],
  },
  {
    lab: 'Borealis Demo Lab',
    name: 'Borealis Drift (demo)',
    releaseDate: '2026-06-30',
    scores: [
      { benchmark: 'Demo Coding Set', value: 87 },
      { benchmark: 'Demo Reasoning Set', value: 45.75 },
    ],
  },
];
