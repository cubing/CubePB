import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("userUserFollowLink", function (table) {
    table.increments();
    table.integer("user").notNullable();
    table.integer("target").notNullable();
    table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
    table.dateTime("updated_at").nullable();
    table.integer("created_by").notNullable();
    table.unique(["user", "target"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("userUserFollowLink");
}
