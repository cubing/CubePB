import { env } from "../config";
import * as jwt from "jsonwebtoken";
import { User, ApiKey } from "../schema/services";
import { userRoleKenum, userPermissionEnum } from "../schema/enums";
import { userRoleToPermissionsMap } from "../schema/helpers/permissions";
import type { ContextUser } from "../types";
import * as sqlHelper from "../schema/core/helpers/sql";

export async function validateToken(auth: string): Promise<ContextUser> {
  if (auth.split(" ")[0] !== "Bearer") {
    throw new Error("Invalid Token");
  }

  const token = auth.split(" ")[1];

  try {
    const decodedToken: any = await jwt.verify(token, env.general.jwt_secret);

    if (!decodedToken.id) {
      throw new Error("Bad ID token");
    }

    const contextUser: ContextUser = {
      id: parseInt(decodedToken.id),
      role: null,
      permissions: [],
    };

    // fetch role from database
    const userResults = await sqlHelper.fetchTableRows({
      select: [{ field: "role" }, { field: "permissions" }],
      from: User.typename,
      where: {
        fields: [{ field: "id", value: contextUser.id }],
      },
    });

    if (userResults.length > 0) {
      contextUser.role = userRoleKenum.fromIndex(userResults[0].role);
      if (userRoleToPermissionsMap[contextUser.role.name]) {
        contextUser.permissions.push(
          ...userRoleToPermissionsMap[contextUser.role.name]
        );
      }

      // if any extra permissions, also add those
      let parsedPermissions = userResults[0].permissions
        ? userResults[0].permissions
        : [];

      // convert permissions to enums
      parsedPermissions = parsedPermissions.map((ele) =>
        userPermissionEnum.fromName(ele)
      );
      contextUser.permissions.push(...parsedPermissions);
    }

    return contextUser;
  } catch (err) {
    const message = "Token error: " + (err.message || err.name);
    throw new Error(message);
  }
}

export async function validateApiKey(auth: string): Promise<ContextUser> {
  if (!auth) {
    throw new Error("Invalid Api Key");
  }

  try {
    // lookup user by API key
    const apiKeyResults = await sqlHelper.fetchTableRows({
      select: [
        { field: "permissions" },
        { field: "user.id" },
        { field: "user.role" },
        { field: "user.permissions" },
      ],
      from: ApiKey.typename,
      where: {
        fields: [{ field: "code", value: auth }],
      },
    });

    if (apiKeyResults.length < 1) {
      throw new Error("Invalid Api Key");
    }

    const role = userRoleKenum.fromIndex(apiKeyResults[0]["user.role"]);

    const originalUserPermissions: userPermissionEnum[] = (
      apiKeyResults[0]["user.permissions"] ?? []
    )
      .map((ele) => userPermissionEnum.fromName(ele))
      .concat(userRoleToPermissionsMap[role.name] ?? []);

    let finalPermissions = originalUserPermissions;

    if (
      apiKeyResults[0]["permissions"] &&
      apiKeyResults[0]["permissions"].length > 0
    ) {
      const requestedPermissionsSet: Set<userPermissionEnum> = new Set(
        apiKeyResults[0]["permissions"]
          ? apiKeyResults[0]["permissions"].map((ele) =>
              userPermissionEnum.fromName(ele)
            )
          : []
      );

      // check if all requestedPermissions are indeed allowed

      // if user has A_A, skip this
      if (!originalUserPermissions.includes(userPermissionEnum.A_A)) {
        requestedPermissionsSet.forEach((ele) => {
          // if user does not have the specific requested permission, see if they have the wildcard for that permission
          if (!originalUserPermissions.includes(ele)) {
            const wildcardKey = ele.name.split("_")[0] + "_x";
            if (
              !originalUserPermissions.includes(userPermissionEnum[wildcardKey])
            ) {
              requestedPermissionsSet.delete(ele);
              // failing that, remove the permission from the set
            }
          }
        });
      }

      finalPermissions = [...requestedPermissionsSet];
    }

    return {
      id: apiKeyResults[0]["user.id"],
      role,
      permissions: finalPermissions,
    };
  } catch (err) {
    const message = "Token error: " + (err.message || err.name);
    throw new Error(message);
  }
}
