import { createApp } from './app.js';
import { CatalogService } from './catalog/catalog-service.js';
import { createDataSource, readDbConfig } from './db/data-source.js';

const port = Number(process.env.API_PORT ?? 3000);

const dataSource = await createDataSource(readDbConfig()).initialize();
console.log('Connected to PostgreSQL');

createApp({ catalog: new CatalogService(dataSource) }).listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
