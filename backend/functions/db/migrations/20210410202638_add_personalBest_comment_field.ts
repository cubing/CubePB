import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.text("public_comments").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.dropColumn("public_comments");
  });
}
