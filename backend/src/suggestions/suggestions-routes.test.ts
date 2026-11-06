import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { ModelSuggestion } from '../entities/ModelSuggestion.js';
import type { SuggestionInput, SuggestionStore } from './suggestion-store.js';
import { suggestionsRouter } from './suggestions-routes.js';

function createTestApp() {
  const app = express();
  const suggestions: ModelSuggestion[] = [];

  const store: SuggestionStore = {
    list() {
      return Promise.resolve([...suggestions]);
    },
    create(input: SuggestionInput) {
      const suggestion: ModelSuggestion = {
        id: suggestions.length + 1,
        ...input,
      };
      suggestions.push(suggestion);
      return Promise.resolve(suggestion);
    },
  };

  app.use(express.json());
  app.use('/api/model-suggestions', suggestionsRouter(store));
  return app;
}

describe('Model Suggestions API', () => {
  it('GET returns an empty array initially', async () => {
    const response = await request(createTestApp()).get(
      '/api/model-suggestions',
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST creates a new suggestion', async () => {
    const response = await request(createTestApp())
      .post('/api/model-suggestions')
      .send({ name: 'GPT-6', provider: 'OpenAI' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      name: 'GPT-6',
      provider: 'OpenAI',
    });
  });

  it('POST rejects missing fields', async () => {
    const response = await request(createTestApp())
      .post('/api/model-suggestions')
      .send({ name: 'GPT-6' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('POST rejects blank or invalid fields', async () => {
    const app = createTestApp();

    for (const payload of [
      { name: '', provider: 'OpenAI' },
      { name: 'GPT-6', provider: '   ' },
      { name: 123, provider: 'OpenAI' },
      {},
    ]) {
      const response = await request(app)
        .post('/api/model-suggestions')
        .send(payload);

      expect(response.status).toBe(400);
    }
  });

  it('GET returns previously created suggestions', async () => {
    const app = createTestApp();

    await request(app)
      .post('/api/model-suggestions')
      .send({ name: 'GPT-6', provider: 'OpenAI' });

    await request(app)
      .post('/api/model-suggestions')
      .send({ name: 'Claude', provider: 'Anthropic' });

    const response = await request(app).get('/api/model-suggestions');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual([
      { id: 1, name: 'GPT-6', provider: 'OpenAI' },
      { id: 2, name: 'Claude', provider: 'Anthropic' },
    ]);
  });
});
