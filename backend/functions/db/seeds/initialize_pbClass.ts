import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("personalBestClass").del();

  // Inserts seed entries
  await knex("personalBestClass").insert([
    {
      name: "Single",
      set_size: 1,
      created_by: 1,
    },
    {
      name: "Average",
      created_by: 1,
    },
    {
      name: "Mean",
      created_by: 1,
    },
  ]);
}
