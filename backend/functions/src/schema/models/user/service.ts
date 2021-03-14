import { PaginatedService } from "../../core/services";

import { generateItemCreatedByUserGuard } from "../../helpers/permissions";

export class UserService extends PaginatedService {
  defaultTypename = "user";

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
    getMultiple: ({ args }) => {
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
    get: async ({ req, args, fieldPath }) => {
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
