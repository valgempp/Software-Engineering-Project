import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { entities } from '../entities/index.js';
import { migrations } from './migrations/index.js';

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

function requireEnv(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

export function readDbConfig(env: NodeJS.ProcessEnv = process.env): DbConfig {
  return {
    host: requireEnv(env, 'POSTGRES_HOST'),
    port: Number(requireEnv(env, 'POSTGRES_PORT')),
    database: requireEnv(env, 'POSTGRES_DB'),
    username: requireEnv(env, 'POSTGRES_USER'),
    password: requireEnv(env, 'POSTGRES_PASSWORD'),
  };
}

// The schema is only changed by migrations: never `synchronize`.
export function createDataSource(config: DbConfig): DataSource {
  return new DataSource({
    type: 'postgres',
    ...config,
    entities,
    migrations,
    synchronize: false,
    migrationsRun: false,
  });
}
