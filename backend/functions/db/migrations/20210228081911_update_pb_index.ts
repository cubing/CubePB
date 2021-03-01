import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.dropUnique(["pb_class", "event", "set_size"]);
    t.unique(["pb_class", "event", "set_size", "created_by"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.dropUnique(["pb_class", "event", "set_size", "created_by"]);
    t.unique(["pb_class", "event", "set_size"]);
  });
}
