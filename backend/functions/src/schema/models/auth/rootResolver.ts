import { Auth } from "../../services";
import * as Scalars from "../../scalars";
import {
  GiraffeqlRootResolverType,
  GiraffeqlInputFieldType,
  GiraffeqlInputType,
} from "giraffeql";

export default {
  socialLogin: new GiraffeqlRootResolverType({
    name: "socialLogin",
    restOptions: {
      method: "post",
      route: "/socialLogin",
      query: Auth.presets.default,
    },
    type: Auth.typeDef,
    allowNull: false,
    args: new GiraffeqlInputFieldType({
      type: new GiraffeqlInputType({
        name: "socialLogin",
        fields: {
          provider: new GiraffeqlInputFieldType({
            type: Scalars.string,
            required: true,
          }),
          code: new GiraffeqlInputFieldType({
            type: Scalars.string,
            required: true,
          }),
          redirectUri: new GiraffeqlInputFieldType({
            type: Scalars.string,
            required: true,
          }),
        },
      }),
    }),
    resolver: ({ req, args, query, fieldPath }) =>
      Auth.socialLogin({ req, args, query, fieldPath }),
  }),
};
