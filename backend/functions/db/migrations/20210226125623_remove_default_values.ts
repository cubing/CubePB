import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.integer("attempts_succeeded").notNullable().alter();
    t.integer("attempts_total").notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("personalBest", function (t) {
    t.integer("attempts_succeeded").notNullable().defaultTo(1).alter();
    t.integer("attempts_total").notNullable().defaultTo(1).alter();
  });
}
