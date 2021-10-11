import { StringKeyObject } from "giraffeql";
import { AccessControlFunction } from "../../types";
import { NormalService } from "../core/services";
import { userRoleKenum, userPermissionEnum } from "../enums";

export const userRoleToPermissionsMap = {
  [userRoleKenum.ADMIN.name]: [userPermissionEnum.A_A],
  [userRoleKenum.MODERATOR.name]: [
    userPermissionEnum.personalBest_create,
    userPermissionEnum.personalBest_flag,
    userPermissionEnum.product_create,
    userPermissionEnum.userUserFollowLink_get,
  ],
  [userRoleKenum.NORMAL.name]: [
    userPermissionEnum.personalBest_create,
    userPermissionEnum.product_create,
    userPermissionEnum.userUserFollowLink_get,
  ],
};
export function generateItemCreatedByUserGuard(
  service: NormalService
): AccessControlFunction {
  return async function ({ req, args, fieldPath }) {
    // args should be validated already
    const validatedArgs = <StringKeyObject>args;
    //check if logged in
    if (!req.user) return false;

    try {
      const itemRecord = await service.lookupRecord(
        ["createdBy"],
        validatedArgs.item ?? validatedArgs,
        fieldPath
      );

      return itemRecord?.createdBy === req.user.id;
    } catch (err) {
      return false;
    }
  };
}

export function generateUserAdminGuard(): AccessControlFunction {
  return generateUserRoleGuard([userRoleKenum.ADMIN]);
}

export function generateUserRoleGuard(
  allowedRoles: userRoleKenum[]
): AccessControlFunction {
  return async function ({ req }) {
    //check if logged in
    if (!req.user) return false;

    try {
      // role is loaded in helpers/auth on token decode
      /*
      const userRecords = await sqlHelper.fetchTableRows({
        select: [{ field: "role" }],
        from: User.typename,
        where: {
          fields: [{ field: "id", value: req.user.id }],
        },
      });
      */

      if (!req.user.role) return false;
      return allowedRoles.includes(req.user.role);
    } catch (err) {
      return false;
    }
  };
}
