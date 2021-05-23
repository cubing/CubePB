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
