import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("user").del();

  // Inserts seed entries
  await knex("user").insert([
    {
      provider: "wca",
      provider_id: "174145",
      wca_id: "2010CHAN10",
      email: "jc4095@nyu.edu",
      name: "James Chang",
      avatar:
        "https://www.worldcubeassociation.org/assets/missing_avatar_thumb-f0ea801c804765a22892b57636af829edbef25260a65d90aaffbd7873bde74fc.png",
      country: "US",
      is_public: true,
      role: "3",
      permissions: null,
      created_by: 1,
    },
    {
      provider: "wca",
      provider_id: "277",
      wca_id: "2008VIRO01",
      email: "277@worldcubeassociation.org",
      name: "Philippe Virouleau",
      avatar:
        "https://staging.worldcubeassociation.org/uploads/user/avatar/2008VIRO01/1473886131.jpg",
      country: "FR",
      is_public: true,
      role: "3",
      permissions: null,
      created_by: 2,
    },
  ]);

  await knex("event").insert([
    {
      name: "3x3x3",
      code: "333",
      score_method: "STANDARD",
      created_by: 1,
    },
    {
      name: "FMC",
      code: "fmc",
      score_method: "FMC",
      created_by: 1,
    },
    {
      name: "3MBLD",
      code: "3mbld",
      score_method: "MBLD",
      created_by: 1,
    },
  ]);

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
  ]);
}
