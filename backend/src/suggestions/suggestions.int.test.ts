import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createDataSource } from '../db/data-source.js';
import { ModelSuggestion } from '../entities/index.js';
import { TypeOrmSuggestionStore } from './suggestion-store.js';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:17-alpine').start();

  dataSource = await createDataSource({
    host: container.getHost(),
    port: container.getPort(),
    database: container.getDatabase(),
    username: container.getUsername(),
    password: container.getPassword(),
  }).initialize();

  await dataSource.runMigrations();
});

afterAll(async () => {
  await dataSource?.destroy();
  await container?.stop();
});

function api() {
  return request(
    createApp({
      catalog: {
        listLabs: () => Promise.resolve([]),
        findModel: () => Promise.resolve(null),
        listModels: () => Promise.resolve([]),
        modelExists: () => Promise.resolve(false),
        createModel: () => Promise.resolve(null),
      },
      suggestions: new TypeOrmSuggestionStore(
        dataSource.getRepository(ModelSuggestion),
      ),
    }),
  );
}

describe('Model Suggestions PostgreSQL CRUD', () => {
  let id: number;

  it('POST creates a suggestion in PostgreSQL', async () => {
    const res = await api()
      .post('/api/model-suggestions')
      .send({ name: 'Test Model', provider: 'Test Lab' });

    expect(res.status).toBe(201);
    const created: unknown = res.body;
    expect(created).toMatchObject({
      name: 'Test Model',
      provider: 'Test Lab',
    });
    if (
      typeof created !== 'object' ||
      created === null ||
      !('id' in created) ||
      typeof created.id !== 'number'
    ) {
      throw new Error('Invalid suggestion ID');
    }
    id = created.id;

    const saved = await dataSource
      .getRepository(ModelSuggestion)
      .findOneBy({ id });
    expect(saved?.name).toBe('Test Model');
  });

  it('GET lists saved suggestions', async () => {
    const res = await api().get('/api/model-suggestions');

    expect(res.status).toBe(200);
    expect(res.body).toContainEqual({
      id,
      name: 'Test Model',
      provider: 'Test Lab',
    });
  });

  it('GET retrieves a suggestion by ID', async () => {
    const res = await api().get(`/api/model-suggestions/${id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Test Model' });
  });

  it('PUT updates a suggestion in PostgreSQL', async () => {
    const res = await api()
      .put(`/api/model-suggestions/${id}`)
      .send({ name: 'Updated Model', provider: 'Updated Lab' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Updated Model' });

    const saved = await dataSource
      .getRepository(ModelSuggestion)
      .findOneBy({ id });
    expect(saved?.provider).toBe('Updated Lab');
  });

  it('DELETE removes the suggestion from PostgreSQL', async () => {
    const res = await api().delete(`/api/model-suggestions/${id}`);
    expect(res.status).toBe(204);

    const saved = await dataSource
      .getRepository(ModelSuggestion)
      .findOneBy({ id });
    expect(saved).toBeNull();
  });

  it('returns 404 for a deleted suggestion', async () => {
    const res = await api().get(`/api/model-suggestions/${id}`);
    expect(res.status).toBe(404);
  });

  it('rejects invalid IDs', async () => {
    const res = await api().get('/api/model-suggestions/abc');
    expect(res.status).toBe(400);
  });
});
