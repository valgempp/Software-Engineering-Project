import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CatalogSchema1791940953315 implements MigrationInterface {
  name = 'CatalogSchema1791940953315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "benchmarks" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "UQ_9c98d187069f052a83185a01e57" UNIQUE ("name"), CONSTRAINT "PK_7e1ca1c910680770da116e0b95c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."source_type" AS ENUM('BENCHMARK', 'NEWS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sources" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "url" text NOT NULL, "type" "public"."source_type" NOT NULL, "last_success_at" TIMESTAMP WITH TIME ZONE, "last_error" text, CONSTRAINT "PK_85523beafe5a2a6b90b02096443" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "scores" ("model_id" integer NOT NULL, "benchmark_id" integer NOT NULL, "value" numeric(5,2) NOT NULL, "fetched_at" TIMESTAMP WITH TIME ZONE NOT NULL, "source_id" integer NOT NULL, CONSTRAINT "PK_0257d905087d541de4214acfa19" PRIMARY KEY ("model_id", "benchmark_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "models" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(120) NOT NULL, "release_date" date, "community_score" numeric(5,2), "community_rank" integer, "benchmark_score" numeric(5,2), "benchmark_rank" integer, "lab_id" integer NOT NULL, CONSTRAINT "UQ_b578c51704f87d4517e55a40992" UNIQUE ("slug"), CONSTRAINT "PK_ef9ed7160ea69013636466bf2d5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "labs" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "logo_url" text, CONSTRAINT "UQ_45e2ea56577a3d395bd49580fd4" UNIQUE ("name"), CONSTRAINT "PK_6b9d28c1591cef294c224ce31aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" ADD CONSTRAINT "FK_54a293fab12294fdf58176af6ae" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" ADD CONSTRAINT "FK_ee804aa4cea8bd41c4999df8784" FOREIGN KEY ("benchmark_id") REFERENCES "benchmarks"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" ADD CONSTRAINT "FK_8d95d87638e8688e301eaa9252d" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ADD CONSTRAINT "FK_dd46dfa4507f0c5a53a8a45926f" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" DROP CONSTRAINT "FK_dd46dfa4507f0c5a53a8a45926f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" DROP CONSTRAINT "FK_8d95d87638e8688e301eaa9252d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" DROP CONSTRAINT "FK_ee804aa4cea8bd41c4999df8784"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scores" DROP CONSTRAINT "FK_54a293fab12294fdf58176af6ae"`,
    );
    await queryRunner.query(`DROP TABLE "labs"`);
    await queryRunner.query(`DROP TABLE "models"`);
    await queryRunner.query(`DROP TABLE "scores"`);
    await queryRunner.query(`DROP TABLE "sources"`);
    await queryRunner.query(`DROP TYPE "public"."source_type"`);
    await queryRunner.query(`DROP TABLE "benchmarks"`);
  }
}
