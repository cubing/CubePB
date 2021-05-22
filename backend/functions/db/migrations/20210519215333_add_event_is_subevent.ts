import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("event", function (t) {
    t.boolean("is_sub_event").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("event", function (t) {
    t.dropColumn("is_sub_event");
  });
}
