import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("event", function (t) {
    t.string("cubing_icon").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("event", function (t) {
    t.dropColumn("cubing_icon");
  });
}
