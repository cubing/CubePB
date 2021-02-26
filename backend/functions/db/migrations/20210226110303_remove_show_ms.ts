import * as Knex from "knex";

export async function up(knex: Knex): Promise<void[]> {
  return Promise.all([
    knex.schema.alterTable("personalBest", function (t) {
      t.dropColumn("show_ms");
    }),
  ]);
}

export async function down(knex: Knex): Promise<void[]> {
  return Promise.all([
    knex.schema.alterTable("personalBest", function (t) {
      t.boolean("show_ms").notNullable().defaultTo(false);
    }),
  ]);
}
