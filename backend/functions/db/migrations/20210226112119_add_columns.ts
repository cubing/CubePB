import * as Knex from "knex";

export async function up(knex: Knex): Promise<void[]> {
  return Promise.all([
    knex.schema.alterTable("event", function (t) {
      t.integer("max_attempts").notNullable().defaultTo(1);
    }),
    knex.schema.alterTable("personalBestClass", function (t) {
      t.integer("set_size").nullable();
    }),
  ]);
}

export async function down(knex: Knex): Promise<void[]> {
  return Promise.all([
    knex.schema.alterTable("event", function (t) {
      t.dropColumn("max_attempts");
    }),
    knex.schema.alterTable("personalBestClass", function (t) {
      t.dropColumn("set_size");
    }),
  ]);
}
