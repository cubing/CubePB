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
    getMultiple: () => true,
    get: () => true,
    "*": generateUserRoleGuard([userRoleKenum.ADMIN]),
  };
}
