import { User, Auth } from "../../services";

import * as jwt from "jsonwebtoken";
import { generateTypenameField } from "../../core/helpers/typeDef";
import { env } from "../../../config";
import { ObjectTypeDefinition, GiraffeqlObjectType } from "giraffeql";
import * as Scalars from "../../scalars";

const jwtExpirationDays = env.general.jwt_expiration
  ? parseInt(env.general.jwt_expiration)
  : 7;

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
  name: Auth.typename,
  description: "Authentication type",
  fields: {
    ...generateTypenameField(Auth),
    type: {
      type: Scalars.string,
      isArray: false,
      allowNull: false,
      resolver: () => "Bearer",
    },
    token: {
      type: Scalars.string,
      isArray: false,
      allowNull: false,
      resolver: ({ data }) => {
        return jwt.sign(
          {
            id: data.id,
            email: data.email,
            exp:
              Math.floor(Date.now() / 1000) + jwtExpirationDays * 24 * 60 * 60,
          },
          env.general.jwt_secret
        );
      },
    },
    expiration: {
      type: Scalars.number,
      isArray: false,
      allowNull: false,
      resolver: () =>
        Math.floor(Date.now() / 1000) + jwtExpirationDays * 24 * 60 * 60,
    },
    expirationDays: {
      type: Scalars.number,
      isArray: false,
      allowNull: false,
      resolver: () => jwtExpirationDays,
    },
    user: {
      type: User.typeDefLookup,
      isArray: false,
      allowNull: false,
      resolver: ({ req, args, query, fieldPath, data }) => {
        return User.getRecord({
          req,
          args: { id: data.id },
          query,
          fieldPath,
          isAdmin: true,
          data,
        });
      },
    },
  },
});
