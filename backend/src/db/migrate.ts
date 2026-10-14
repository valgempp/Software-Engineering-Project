import { createDataSource, readDbConfig } from './data-source.js';

const dataSource = await createDataSource(readDbConfig()).initialize();
try {
  const applied = await dataSource.runMigrations({ transaction: 'all' });
  console.log(
    applied.length === 0
      ? 'Database schema already up to date.'
      : `Applied migrations: ${applied.map((m) => m.name).join(', ')}`,
  );
} finally {
  await dataSource.destroy();
}
