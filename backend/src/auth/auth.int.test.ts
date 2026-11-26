import bcrypt from 'bcrypt';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import request from 'supertest';
import type { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { createDataSource } from '../db/data-source.js';
import { CatalogService } from '../catalog/catalog-service.js';
import { User } from '../entities/User.js';

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

const app = () =>
  createApp({
    catalog: new CatalogService(dataSource),
    rankingDb: dataSource,
  });

const validUser = {
  email: 'student@example.com',
  username: 'student',
  password: 'Test123456',
  privacyAccepted: true,
};

describe('User registration', () => {
  it('creates an active account and logs the user in', async () => {
    const agent = request.agent(app());

    const res = await agent.post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ active: true });
    expect(res.body).toMatchObject({ username: 'student' });
    expect(res.body).not.toHaveProperty('passwordHash');

    const me = await agent.get('/api/auth/me');

    expect(me.status).toBe(200);
    expect(me.body).toMatchObject({ username: 'student' });
  });

  it('stores the password as a bcrypt hash', async () => {
    const user = await dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: validUser.email })
      .getOneOrFail();

    expect(user.passwordHash).not.toBe(validUser.password);
    expect(await bcrypt.compare(validUser.password, user.passwordHash)).toBe(
      true,
    );
  });

  it('rejects a duplicate email', async () => {
    const res = await request(app())
      .post('/api/auth/register')
      .send({ ...validUser, username: 'otheruser' });

    expect(res.status).toBe(409);
  });

  it('rejects a duplicate username', async () => {
    const res = await request(app())
      .post('/api/auth/register')
      .send({ ...validUser, email: 'other@example.com' });

    expect(res.status).toBe(409);
  });

  it.each([
    { email: 'invalid-email' },
    { username: '   ' },
    { password: '123' },
    { privacyAccepted: false },
    { email: undefined },
    { privacyAccepted: undefined },
  ])('rejects invalid registration data: %j', async (invalid) => {
    const before = await dataSource.getRepository(User).count();

    const res = await request(app())
      .post('/api/auth/register')
      .send({ ...validUser, ...invalid });

    expect(res.status).toBe(400);
    expect(await dataSource.getRepository(User).count()).toBe(before);
  });

  it('rejects access without authentication', async () => {
    const res = await request(app()).get('/api/auth/me');

    expect(res.status).toBe(401);
  });
});
