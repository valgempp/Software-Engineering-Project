import type { Repository } from 'typeorm';
import type { ModelSuggestion } from '../entities/ModelSuggestion.js';

export interface SuggestionInput {
  name: string;
  provider: string;
}

export interface SuggestionStore {
  list(): Promise<ModelSuggestion[]>;
  create(input: SuggestionInput): Promise<ModelSuggestion>;
}

export class TypeOrmSuggestionStore implements SuggestionStore {
  constructor(private readonly repository: Repository<ModelSuggestion>) {}

  list(): Promise<ModelSuggestion[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  async create(input: SuggestionInput): Promise<ModelSuggestion> {
    const suggestion = this.repository.create(input);
    return this.repository.save(suggestion);
  }
}
