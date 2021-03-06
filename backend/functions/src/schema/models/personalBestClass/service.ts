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
    createdAt: {},
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
