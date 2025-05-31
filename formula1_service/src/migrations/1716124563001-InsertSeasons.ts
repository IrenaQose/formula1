import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertSeasons1716124563001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2004 },
      (_, i) => 2005 + i
    );

    const values = years
      .map(year => `(${year}, NOW(), NOW())`)
      .join(',\n');

    await queryRunner.query(`
      INSERT INTO seasons (year, created_at, updated_at)
      VALUES ${values}
      ON CONFLICT (year) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2004 },
      (_, i) => 2005 + i
    );

    await queryRunner.query(`
      DELETE FROM seasons 
      WHERE year >= 2005 AND year <= ${currentYear};
    `);
  }
} 