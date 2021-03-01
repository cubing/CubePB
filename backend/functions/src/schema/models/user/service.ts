import { PaginatedService } from "../../core/services";

import { generateUserRoleGuard } from "../../helpers/permissions";
import { userRoleKenum } from "../../enums";

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
    get: async ({ args, fieldPath }) => {
      // check the user to see if is_public === true
      const result = await this.lookupRecord(
        [
          {
            field: "is_public",
          },
        ],
        args,
        fieldPath
      );
      return result.is_public === true;
    },
  };
}
