import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("event").del();

  await knex("event").insert([
    {
      name: "3x3x3",
      code: "333",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "2x2x2",
      code: "222",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "4x4x4",
      code: "444",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "5x5x5",
      code: "555",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "6x6x6",
      code: "666",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "7x7x7",
      code: "777",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "3x3x3 OH",
      code: "333oh",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "Clock",
      code: "clock",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "Megaminx",
      code: "minx",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "Pyraminx",
      code: "pyram",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "Skewb",
      code: "skewb",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "Square-1",
      code: "sq1",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "3x3x3 Blindfolded",
      code: "333bf",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "4x4x4 Blindfolded",
      code: "444bf",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "5x5x5 Blindfolded",
      code: "555bf",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "3x3x3 Fewest Moves",
      code: "333fm",
      score_method: "FMC",
      created_by: 1,
    },
    {
      name: "3x3x3 Multi-Blind",
      code: "333mbf",
      score_method: "MBLD",
      created_by: 1,
    },
  ]);
}
