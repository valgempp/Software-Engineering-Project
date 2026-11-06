import { Table } from 'typeorm';
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ModelSuggestions1791940953316 implements MigrationInterface {
  name = 'ModelSuggestions1791940953316';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'model_suggestions',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'provider', type: 'varchar', length: '100' },
        ],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('model_suggestions');
  }
}
