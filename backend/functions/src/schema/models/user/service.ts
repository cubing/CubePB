import { PaginatedService } from "../../core/services";
import { userRoleKenum } from "../../enums";

import { generateItemCreatedByUserGuard } from "../../helpers/permissions";

export class UserService extends PaginatedService {
  defaultTypename = "user";

  presets = {
    default: {
      id: true,
    },
  };

  filterFieldsMap = {
    id: {},
    "created_by.id": {},
    "created_by.name": {},
    role: {},
    name: {},
    is_public: {},
  };

  sortFieldsMap = {
    id: {},
    created_at: {},
    updated_at: {},
  };

  searchFieldsMap = {
    name: {},
  };

  accessControl = {
    getMultiple: ({ req, args, query }) => {
      // if role, permissions, all_permissions, or email field requested, must be ADMIN
      if (
        query &&
        Object.keys(query).some((field) =>
          ["role", "permissions", "all_permissions", "email"].includes(field)
        ) &&
        req.user?.role !== userRoleKenum.ADMIN
      ) {
        return false;
      }

      // every args.filterBy array member MUST have is_public: true
      if (
        Array.isArray(args.filterBy) &&
        args.filterBy.length > 0 &&
        args.filterBy.every((filterObject) => {
          return filterObject.is_public.eq === true;
        })
      ) {
        return true;
      }

      return false;
    },
    get: async ({ req, args, fieldPath, query }) => {
      // if role, permissions, all_permissions, or email field requested, must be ADMIN
      if (
        query &&
        Object.keys(query).some((field) =>
          ["role", "permissions", "all_permissions", "email"].includes(field)
        ) &&
        req.user?.role !== userRoleKenum.ADMIN
      ) {
        return false;
      }
      // check the user to see if is_public === true
      const result = await this.lookupRecord(
        [
          {
            field: "created_by",
          },
          {
            field: "is_public",
          },
        ],
        args,
        fieldPath
      );

      // OR if the user created the item
      return result.is_public === true || result.created_by === req.user?.id;
    },
    // allowed to update if user created the item
    update: generateItemCreatedByUserGuard(this),
  };
}
