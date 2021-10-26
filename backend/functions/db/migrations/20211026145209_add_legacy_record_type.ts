import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("legacyRecord", function (table) {
    table.increments();
    table.string("wca_event_id").nullable();
    table.integer("record_type").notNullable();
    table.integer("number_of_solves").notNullable();
    table.integer("result").notNullable();
    table.string("other_event_name").nullable();
    table.string("main_cube").nullable();
    table.integer("event_type").notNullable();
    table.dateTime("date").nullable();
    table.string("email").notNullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").nullable();
    table.integer("created_by").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("legacyRecord");
}
