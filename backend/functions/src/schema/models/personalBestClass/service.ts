import { PaginatedService } from "../../core/services";

export class PersonalBestClassService extends PaginatedService {
  defaultTypename = "personalBestClass";

  filterFieldsMap = {
    id: {},
    "createdBy.id": {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
    created_at: {},
  };

  searchFieldsMap = {
    name: {},
  };

  groupByFieldsMap = {};

  accessControl = {
    get: () => true,
    getMultiple: () => true,
  };
}
