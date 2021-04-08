import { userRoleKenum, userPermissionEnum } from "../enums";

export const userRoleToPermissionsMap = {
  [userRoleKenum.ADMIN.name]: [userPermissionEnum.A_A],
  [userRoleKenum.NORMAL.name]: [
    userPermissionEnum.personalBest_create,
    userPermissionEnum.product_create,
    userPermissionEnum.userUserFollowLink_get,
  ],
};
