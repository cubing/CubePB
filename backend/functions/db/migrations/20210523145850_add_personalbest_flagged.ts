import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.boolean("is_flagged").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.dropColumn("is_flagged");
  });
}
