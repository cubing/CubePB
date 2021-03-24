import { PaginatedService } from "../../core/services";

export class ProductService extends PaginatedService {
  defaultTypename = "product";

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
