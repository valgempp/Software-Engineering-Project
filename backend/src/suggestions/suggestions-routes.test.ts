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
    findById(id: number) {
      return Promise.resolve(suggestions.find((s) => s.id === id) ?? null);
    },
    update(id: number, input: SuggestionInput) {
      const suggestion = suggestions.find((s) => s.id === id);
      if (!suggestion) return Promise.resolve(null);
      Object.assign(suggestion, input);
      return Promise.resolve({ ...suggestion });
    },
    delete(id: number) {
      const index = suggestions.findIndex((s) => s.id === id);
      if (index === -1) return Promise.resolve(false);
      suggestions.splice(index, 1);
      return Promise.resolve(true);
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

  it('GET by ID returns a suggestion', async () => {
    const app = createTestApp();
    await request(app)
      .post('/api/model-suggestions')
      .send({ name: 'GPT-6', provider: 'OpenAI' });

    const res = await request(app).get('/api/model-suggestions/1');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'GPT-6' });
  });

  it('GET by ID returns 404 when missing', async () => {
    const res = await request(createTestApp()).get(
      '/api/model-suggestions/999',
    );

    expect(res.status).toBe(404);
  });

  it('PUT updates a suggestion', async () => {
    const app = createTestApp();
    await request(app)
      .post('/api/model-suggestions')
      .send({ name: 'GPT-6', provider: 'OpenAI' });

    const res = await request(app)
      .put('/api/model-suggestions/1')
      .send({ name: 'Claude', provider: 'Anthropic' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Claude' });
    expect(res.body).toMatchObject({ provider: 'Anthropic' });
  });

  it('PUT returns 404 when missing', async () => {
    const res = await request(createTestApp())
      .put('/api/model-suggestions/999')
      .send({ name: 'Claude', provider: 'Anthropic' });

    expect(res.status).toBe(404);
  });

  it('DELETE removes a suggestion', async () => {
    const app = createTestApp();
    await request(app)
      .post('/api/model-suggestions')
      .send({ name: 'GPT-6', provider: 'OpenAI' });

    const res = await request(app).delete('/api/model-suggestions/1');

    expect(res.status).toBe(204);

    const check = await request(app).get('/api/model-suggestions/1');

    expect(check.status).toBe(404);
  });

  it('DELETE returns 404 when missing', async () => {
    const res = await request(createTestApp()).delete(
      '/api/model-suggestions/999',
    );

    expect(res.status).toBe(404);
  });
});
