// Entry point of the TypeORM CLI (migration:generate), which needs a file exporting one DataSource.
import { createDataSource, readDbConfig } from './data-source.js';

export default createDataSource(readDbConfig());
