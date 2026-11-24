import type { Repository } from 'typeorm';
import type { ModelSuggestion } from '../entities/ModelSuggestion.js';

export interface SuggestionInput {
  name: string;
  provider: string;
}

export interface SuggestionStore {
  list(): Promise<ModelSuggestion[]>;
  findById(id: number): Promise<ModelSuggestion | null>;
  create(input: SuggestionInput): Promise<ModelSuggestion>;
  update(id: number, input: SuggestionInput): Promise<ModelSuggestion | null>;
  delete(id: number): Promise<boolean>;
}

export class TypeOrmSuggestionStore implements SuggestionStore {
  constructor(private readonly repository: Repository<ModelSuggestion>) {}

  list(): Promise<ModelSuggestion[]> {
    return this.repository.find({ order: { id: 'ASC' } });
  }

  findById(id: number): Promise<ModelSuggestion | null> {
    return this.repository.findOneBy({ id });
  }

  async create(input: SuggestionInput): Promise<ModelSuggestion> {
    const suggestion = this.repository.create(input);
    return this.repository.save(suggestion);
  }

  async update(
    id: number,
    input: SuggestionInput,
  ): Promise<ModelSuggestion | null> {
    const suggestion = await this.findById(id);
    if (!suggestion) return null;

    suggestion.name = input.name;
    suggestion.provider = input.provider;
    return this.repository.save(suggestion);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
