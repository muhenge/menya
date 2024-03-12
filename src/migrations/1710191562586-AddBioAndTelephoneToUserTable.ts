import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBioAndTelephoneToUserTable1710191562586
  implements MigrationInterface
{
  name = 'AddBioAndTelephoneToUserTable1710191562586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "bio" character varying(130) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "telephone" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "isConfirmed" SET DEFAULT 'false'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "isConfirmed" SET DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "telephone"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bio"`);
  }
}
