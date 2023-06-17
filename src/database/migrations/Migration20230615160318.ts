import { Migration } from '@mikro-orm/migrations';

export class Migration20230615160318 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "password" varchar(255) not null, "is_admin" boolean not null, "profile_picture" varchar(255) null);');
    this.addSql('create index "user_name_index" on "user" ("name");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');
  }

}
