import { LinkService } from "../../core/services";
import {
  generateUserRoleGuard,
  permissionsCheck,
} from "../../core/helpers/permissions";
import { userRoleKenum } from "../../enums";
import { ServiceFunctionInputs, AccessControlMap } from "../../../types";
import * as Resolver from "../../core/helpers/resolver";
import { User } from "../../services";

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

  accessControl: AccessControlMap = {
    // anyone allowed to get followers/followee lists
    getMultiple: () => true,
    create: async ({ req, args, fieldPath }) => {
      // handle lookupArgs, convert lookups into ids
      await this.handleLookupArgs(args, fieldPath);

      // userId must be logged in and current user, else deny
      if (!req.user || args.user !== req.user.id) return false;

      // target must be public user
      const targetUser = await User.lookupRecord(
        [
          {
            field: "isPublic",
          },
        ],
        args.target,
        fieldPath
      );

      // else deny
      if (!targetUser.isPublic) return false;
      return true;
    },
    delete: async ({ req, args, fieldPath }) => {
      // user must be logged in, else deny
      if (!req.user) return false;

      // "user" field on the link must be current user, else deny
      const record = await this.lookupRecord(
        [
          {
            field: "user.id",
          },
        ],
        args,
        fieldPath
      );

      if (record["user.id"] !== req.user.id) return false;

      return true;
    },
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
    await this.handleLookupArgs(validatedArgs, fieldPath);

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        ...validatedArgs,
        createdBy: req.user!.id,
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
