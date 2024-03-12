import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1710188723332 implements MigrationInterface {
  name = 'CreateUserTable1710188723332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL DEFAULT '', "firstName" character varying, "lastName" character varying, "username" character varying(50) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "avatar" character varying, "about" character varying, "jti" character varying NOT NULL, "isConfirmed" boolean NOT NULL DEFAULT 'false', CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_3d9c79d26f89df096b3e87fbac6" UNIQUE ("jti"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
