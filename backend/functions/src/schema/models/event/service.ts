import { PaginatedService } from "../../core/services";

export class EventService extends PaginatedService {
  defaultTypename = "event";

  filterFieldsMap = {
    id: {},
    created_by: {
      field: "created_by.id",
    },
    code: {},
  };

  uniqueKeyMap = {
    primary: ["id"],
    secondary: ["code"],
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
