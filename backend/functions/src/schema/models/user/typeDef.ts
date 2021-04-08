// import * as bcrypt from "bcryptjs";
import { knex } from "../../../utils/knex";

import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
import { User } from "../../services";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateEnumField,
  generateBooleanField,
  generateArrayField,
  generateTypenameField,
} from "../../core/helpers/typeDef";
import * as Scalars from "../../scalars";
import { userRoleToPermissionsMap } from "../../helpers/permissions";
import { userRoleKenum } from "../../enums";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
  name: User.typename,
  description: "User type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(User),
    provider: generateStringField({
      allowNull: false,
      typeDefOptions: { addable: true, updateable: false },
      sqlOptions: { unique: "compositeIndex" },
      hidden: true,
    }),
    providerId: generateStringField({
      allowNull: false,
      typeDefOptions: { addable: true, updateable: false },
      sqlOptions: {
        field: "provider_id",
        unique: "compositeIndex",
      },
      hidden: true,
    }),
    wcaId: generateStringField({
      allowNull: true,
      sqlOptions: {
        field: "wca_id",
      },
      typeDefOptions: { addable: true, updateable: false },
    }),
    email: generateStringField({
      allowNull: false,
      sqlOptions: { unique: true },
      nestHidden: true,
    }),
    name: generateStringField({ allowNull: false }),
    avatar: generateStringField({
      allowNull: true,
    }),
    country: generateStringField({
      allowNull: true,
    }),
    isPublic: generateBooleanField({
      allowNull: false,
      defaultValue: true,
      sqlOptions: { field: "is_public" },
    }),
    isFeatured: generateBooleanField({
      allowNull: false,
      defaultValue: false,
      sqlOptions: { field: "is_featured" },
    }),
    role: generateEnumField({
      scalarDefinition: Scalars.userRole,
      allowNull: false,
      defaultValue: "NONE",
      isKenum: true,
      nestHidden: true,
    }),
    permissions: generateArrayField({
      allowNull: true,
      type: Scalars.userPermission,
      nestHidden: true,
    }),
    allPermissions: {
      type: Scalars.userPermission,
      arrayOptions: {
        allowNullElement: false,
      },
      requiredSqlFields: ["role", "permissions"],
      allowNull: false,
      nestHidden: true,
      async resolver({ parentValue }) {
        const role = parentValue.role;
        const permissions = parentValue.permissions;

        // convert role to name
        const roleName = userRoleKenum.fromIndex(role).name;

        const rolePermissionsArray = (
          userRoleToPermissionsMap[roleName] ?? []
        ).map((ele) => ele.name);

        const permissionsArray = permissions ?? [];

        // fetch the user role IF it is not provided
        return rolePermissionsArray.concat(permissionsArray);
      },
    },
    // foreign sql field
    currentUserFollowing: {
      type: Scalars.id,
      allowNull: true,
      sqlOptions: {
        field: "id",
        specialJoin: {
          foreignTable: "userUserFollowLink",
          joinFunction: (
            knexObject,
            parentTableAlias,
            joinTableAlias,
            specialParams
          ) => {
            knexObject.leftJoin(
              {
                [joinTableAlias]: "userUserFollowLink",
              },
              (builder) => {
                builder
                  .on(parentTableAlias + ".id", "=", joinTableAlias + ".target")
                  .andOn(
                    specialParams.currentUserId
                      ? knex.raw(`"${joinTableAlias}".user = ?`, [
                          specialParams.currentUserId,
                        ])
                      : knex.raw("false")
                  );
              }
            );
          },
        },
      },
    },
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
