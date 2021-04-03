import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("user", function (t) {
    t.boolean("is_featured").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("user", function (t) {
    t.dropColumn("is_featured");
  });
}
