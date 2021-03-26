import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.decimal("moves_count").nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.integer("moves_count").nullable().alter();
  });
}
