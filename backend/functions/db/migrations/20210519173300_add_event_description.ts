import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("event", function (t) {
    t.text("description").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("event", function (t) {
    t.dropColumn("description");
  });
}
