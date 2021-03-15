import { PaginatedService } from "../../core/services";

export class PersonalBestClassService extends PaginatedService {
  defaultTypename = "personalBestClass";

  filterFieldsMap = {
    id: {},
    created_by: {
      field: "created_by.id",
    },
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
