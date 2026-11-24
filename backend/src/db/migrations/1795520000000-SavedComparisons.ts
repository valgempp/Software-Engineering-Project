import { Table, type MigrationInterface, type QueryRunner } from 'typeorm';
export class SavedComparisons1795520000000 implements MigrationInterface {
  async up(runner: QueryRunner): Promise<void> {
    await runner.createTable(
      new Table({
        name: 'saved_comparisons',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'models', type: 'jsonb' },
        ],
      }),
    );
  }
  async down(runner: QueryRunner): Promise<void> {
    await runner.dropTable('saved_comparisons');
  }
}
