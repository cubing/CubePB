import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("apiKey", function (table) {
    table.increments();
    table.string("name").notNullable();
    table.string("code").notNullable().unique();
    table.integer("user").notNullable();
    table.json("permissions").nullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").nullable();
    table.integer("created_by").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("apiKey");
}
