import * as Knex from "knex";

export async function up(knex: Knex): Promise<void[]> {
  return Promise.all([
    knex.schema.createTable("user", function (table) {
      table.increments();
      table.string("provider").notNullable();
      table.string("provider_id").notNullable();
      table.string("wca_id").nullable();
      table.string("email").notNullable().unique();
      table.string("name").notNullable();
      table.string("avatar").nullable();
      table.string("country").nullable();
      table.boolean("is_public").notNullable().defaultTo(true);
      table.integer("role").notNullable().defaultTo(2);
      table.json("permissions").nullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").nullable();
      table.integer("created_by").notNullable();
      table.unique(["provider", "provider_id"]);
    }),
    knex.schema.createTable("event", function (table) {
      table.increments();
      table.string("name").notNullable();
      table.string("code").notNullable().unique();
      table.string("score_method").notNullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").nullable();
      table.integer("created_by").notNullable();
    }),
    knex.schema.createTable("product", function (table) {
      table.increments();
      table.string("name").notNullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").nullable();
      table.integer("created_by").notNullable();
    }),
    knex.schema.createTable("personalBestClass", function (table) {
      table.increments();
      table.string("name").notNullable();
      table.text("description").nullable();
      table.integer("set_size").nullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").nullable();
      table.integer("created_by").notNullable();
    }),
    knex.schema.createTable("personalBest", function (table) {
      table.increments();
      table.integer("pb_class").notNullable();
      table.integer("event").notNullable();
      table.integer("set_size").notNullable();
      table.integer("score").notNullable();
      table.integer("attempts_succeeded").nullable();
      table.integer("attempts_total").nullable();
      table.integer("product").nullable();
      table.dateTime("happened_on").notNullable();
      table.integer("time_elapsed").nullable();
      table.integer("moves_count").nullable();
      table.boolean("is_current").notNullable();
      table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
      table.dateTime("updated_at").nullable();
      table.integer("created_by").notNullable();
      // table.unique(["pb_class", "event", "set_size", "created_by"]);
    }),
  ]);
}

export async function down(knex: Knex): Promise<void[]> {
  return Promise.all([
    knex.schema.dropTable("user"),
    knex.schema.dropTable("event"),
    knex.schema.dropTable("product"),
    knex.schema.dropTable("personalBestClass"),
    knex.schema.dropTable("personalBest"),
  ]);
}
