import { AccessControlMap, ServiceFunctionInputs } from "../../../types";
import { permissionsCheck } from "../../core/helpers/permissions";
import { createObjectType } from "../../core/helpers/resolver";
import { PaginatedService } from "../../core/services";
import * as randomstring from "randomstring";

export class ApiKeyService extends PaginatedService {
  defaultTypename = "apiKey";

  filterFieldsMap = {
    id: {},
    "user.id": {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
    createdAt: {},
  };

  searchFieldsMap = {};

  groupByFieldsMap = {};

  accessControl: AccessControlMap = {
    // user only allowed to get apiKey if they are the 'user'
    get: async ({ req, args, fieldPath }) => {
      // user must be logged in, else deny
      if (!req.user) return false;

      // "user" field on the link must be current user, else deny
      const record = await this.lookupRecord(["user.id"], args, fieldPath);

      if (record["user.id"] !== req.user.id) return false;

      return true;
    },

    // user only allowed to list apiKeys if they are the 'user'
    getMultiple: ({ req, args }) => {
      // filterBy must have user.id === req.user.id
      if (
        Array.isArray(args.filterBy) &&
        args.filterBy.length > 0 &&
        args.filterBy.every((filterObject) => {
          return filterObject["user.id"]?.eq === req.user?.id;
        })
      ) {
        return true;
      }

      return false;
    },

    // user only allowed to update apiKeys if they are the 'user'
    update: async ({ req, args, fieldPath }) => {
      // user must be logged in, else deny
      if (!req.user) return false;

      // "user" field on the link must be current user, else deny
      const record = await this.lookupRecord(["user.id"], args.item, fieldPath);

      if (record["user.id"] !== req.user.id) return false;

      return true;
    },

    // user only allowed to delete apiKeys if they are the 'user'
    delete: async ({ req, args, fieldPath }) => {
      // user must be logged in, else deny
      if (!req.user) return false;

      // "user" field on the link must be current user, else deny
      const record = await this.lookupRecord(["user.id"], args, fieldPath);

      if (record["user.id"] !== req.user.id) return false;

      return true;
    },

    // user only allowed to add apiKey with self as the 'user' field
    create: async ({ req, args, fieldPath }) => {
      // handle lookupArgs, convert lookups into ids
      await this.handleLookupArgs(args, fieldPath);

      // userId must be logged in and current user, else deny
      if (!req.user || args.user !== req.user.id) return false;

      return true;
    },
  };

  @permissionsCheck("create")
  async createRecord({
    req,
    fieldPath,
    args,
    query,
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;

    await this.handleLookupArgs(args, fieldPath);

    const addResults = await createObjectType({
      typename: this.typename,
      addFields: {
        ...validatedArgs,
        code: randomstring.generate(20),
        createdBy: req.user!.id,
      },
      req,
      fieldPath,
    });

    return this.getRecord({
      req,
      fieldPath,
      args: { id: addResults.id },
      query,
      isAdmin,
    });
  }
}
