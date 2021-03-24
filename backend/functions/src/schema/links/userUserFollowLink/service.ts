import { LinkService } from "../../core/services";
import {
  generateUserRoleGuard,
  permissionsCheck,
} from "../../helpers/permissions";
import { userRoleKenum } from "../../enums";
import { ServiceFunctionInputs } from "../../../types";
import * as Resolver from "../../helpers/resolver";

export class UserUserFollowLinkService extends LinkService {
  defaultTypename = "userUserFollowLink";

  filterFieldsMap = {
    "user.id": {},
    "target.id": {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    createdAt: {},
  };

  searchFieldsMap = {};

  groupByFieldsMap = {};

  accessControl = {
    create: generateUserRoleGuard([userRoleKenum.ADMIN]),
    delete: generateUserRoleGuard([userRoleKenum.ADMIN]),
  };

  @permissionsCheck("create")
  async createRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    await this.handleLookupArgs(args, fieldPath);

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        ...validatedArgs,
        created_by: req.user!.id,
      },
      req,
      fieldPath,
      extendFn: (knexObject) => {
        knexObject.onConflict(["user", "target"]).merge();
      },
    });

    return this.getRecord({
      req,
      args: { id: addResults.id },
      query,
      fieldPath,
      isAdmin,
      data,
    });
  }
}
