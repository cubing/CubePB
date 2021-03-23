import { User } from "../../services";
import { generateBaseRootResolvers } from "../../helpers/rootResolver";
import { JomqlRootResolverType } from "jomql";
import { Scalars } from "../..";
import * as sqlHelper from "../../helpers/sql";

export default {
  getCurrentUser: new JomqlRootResolverType({
    name: "getCurrentUser",
    restOptions: {
      method: "get",
      route: "/currentUser",
      query: User.presets.default,
    },
    allowNull: false,
    type: User.typeDefLookup,
    resolver: ({ req, fieldPath, args, query }) => {
      if (!req.user?.id) throw new Error("Login required");
      return User.getRecord({
        req,
        fieldPath,
        args: { id: req.user?.id },
        query,
        isAdmin: true,
      });
      // always allow user to get own user
    },
  }),
  test: new JomqlRootResolverType({
    name: "test",
    allowNull: true,
    type: Scalars.unknown,
    resolver: async ({ req, fieldPath, args, query }) => {
      const results = await sqlHelper.fetchTableRows(
        {
          select: [
            { field: "id" },
            { field: "name" },
            { field: "bar.id" },
            { field: "bar.bar.id" },
            { field: "created_by.id" },
            { field: "created_at" },
            { field: "current_user_following" },
          ],
          from: "user",
          where: {
            fields: [
              {
                field: "id",
                operator: "in",
                value: [8],
              },
            ],
          },
          orderBy: [
            {
              field: "created_at",
              desc: true,
            },
          ],
          specialParams: {
            currentUserId: 7,
          },
          distinct: true,
        },
        []
      );
      /*     const userResults = await sqlHelper.fetchTableRows({
      select: [{ field: "role" }, { field: "permissions" }],
      from: User.typename,
      where: {
        fields: [{ field: "id", value: contextUser.id }],
      },
    }); */

      /*       const results = await knex("user").countDistinct("id").where({
        id: 7,
      }); */

      /*        const results = await knex
        .select({
          created_at: knex.raw(`extract(epoch from user0.created_at)`),
        })
        .from({ user0: "user" })
        .leftJoin({ user1: "user" }, "user0.created_by", "user1.id"); */

      return results;
    },
  }),
  ...generateBaseRootResolvers(User, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
