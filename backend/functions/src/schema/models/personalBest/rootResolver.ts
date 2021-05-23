import { PersonalBest } from "../../services";
import { generateBaseRootResolvers } from "../../core/helpers/rootResolver";
import {
  GiraffeqlInputFieldType,
  GiraffeqlInputType,
  GiraffeqlInputTypeLookup,
  GiraffeqlRootResolverType,
} from "giraffeql";

export default {
  ...generateBaseRootResolvers(PersonalBest, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
  flagPersonalBest: new GiraffeqlRootResolverType({
    name: "flagPersonalBest",
    restOptions: {
      method: "post",
      route: "/flagPersonalBest",
    },
    type: PersonalBest.typeDef,
    allowNull: false,
    args: new GiraffeqlInputFieldType({
      required: true,
      type: new GiraffeqlInputType({
        name: "flagPersonalBest",
        fields: {
          item: new GiraffeqlInputFieldType({
            type: PersonalBest.inputTypeDefLookup,
            required: true,
          }),
        },
      }),
    }),
    resolver: ({ req, args, query, fieldPath }) =>
      PersonalBest.flagRecord({ req, args, query, fieldPath }),
  }),
};
