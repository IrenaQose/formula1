import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1716124563000 implements MigrationInterface {
  name = 'CreateInitialTables1716124563000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create seasons table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "seasons" (
                "id" SERIAL NOT NULL,
                "year" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_seasons_year" UNIQUE ("year"),
                CONSTRAINT "PK_seasons" PRIMARY KEY ("id")
            )
        `);

    // Create constructors table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "constructors" (
                "id" SERIAL NOT NULL,
                "constructor_ref" character varying NOT NULL,
                "name" character varying NOT NULL,
                "nationality" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_constructors_constructor_ref" UNIQUE ("constructor_ref"),
                CONSTRAINT "PK_constructors" PRIMARY KEY ("id")
            )
        `);

    // Create drivers table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "drivers" (
                "id" SERIAL NOT NULL,
                "driver_ref" character varying NOT NULL,
                "permanent_number" integer,
                "first_name" character varying NOT NULL,
                "last_name" character varying NOT NULL,
                "birth_date" date NOT NULL,
                "nationality" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_drivers_driver_ref" UNIQUE ("driver_ref"),
                CONSTRAINT "PK_drivers" PRIMARY KEY ("id")
            )
        `);

    // Create races table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "races" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "date" date NOT NULL,
                "time" time NULL,
                "season_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_races" PRIMARY KEY ("id"),
                CONSTRAINT "FK_races_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

    // Create results table
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "results" (
                "id" SERIAL NOT NULL,
                "points" double precision NOT NULL,
                "position" integer,
                "grid" integer,
                "laps" integer NOT NULL,
                "status" character varying NOT NULL,
                "time" varchar(20),
                "season_id" integer NOT NULL,
                "driver_id" integer NOT NULL,
                "race_id" integer NOT NULL,
                "constructor_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_results_driver_race" UNIQUE ("driver_id", "race_id"),
                CONSTRAINT "PK_results" PRIMARY KEY ("id"),
                CONSTRAINT "FK_results_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_results_driver" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_results_race" FOREIGN KEY ("race_id") REFERENCES "races"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_results_constructor" FOREIGN KEY ("constructor_id") REFERENCES "constructors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "driver_standings" (
                "id" SERIAL NOT NULL,
                "driver_id" integer NOT NULL,
                "season_id" integer NOT NULL,
                "constructor_team_id" integer NOT NULL,
                "points" decimal(10,2) NOT NULL,
                "position" integer NOT NULL,
                "wins" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_driver_standings_driver_season" UNIQUE ("driver_id", "season_id", "constructor_team_id"),
                CONSTRAINT "PK_driver_standings" PRIMARY KEY ("id"),
                CONSTRAINT "FK_driver_standings_driver" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_driver_standings_season" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_driver_standings_constructor" FOREIGN KEY ("constructor_team_id") REFERENCES "constructors"("id") ON DELETE CASCADE
            )
        `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_races_season_id" ON "races" ("season_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_results_season_id" ON "results" ("season_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_results_driver_id" ON "results" ("driver_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_results_race_id" ON "results" ("race_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_results_constructor_id" ON "results" ("constructor_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_results_constructor_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_results_race_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_results_driver_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_results_season_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_races_season_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "results"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "races"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "constructors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "seasons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "driver_standings"`);
  }
}
