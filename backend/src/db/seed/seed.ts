import { createDataSource, readDbConfig } from '../data-source.js';
import { seedDemoData } from './seed-demo-data.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The demo seed must not run in production');
}

const dataSource = await createDataSource(readDbConfig()).initialize();
try {
  await seedDemoData(dataSource);
  console.log('Demo data seeded.');
} finally {
  await dataSource.destroy();
}
