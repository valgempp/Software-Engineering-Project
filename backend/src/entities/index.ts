import { ModelSuggestion } from './ModelSuggestion.js';
import { Benchmark } from './Benchmark.js';
import { Lab } from './Lab.js';
import { LLMModel } from './LLMModel.js';
import { Score } from './Score.js';
import { Source } from './Source.js';

export { Benchmark, Lab, LLMModel, ModelSuggestion, Score, Source };
export { SourceType } from './Source.js';

export const entities = [
  Lab,
  LLMModel,
  Benchmark,
  Score,
  Source,
  ModelSuggestion,
];
