import { PaginatedService } from "../../core/services";
import { AccessControlMap, ServiceFunctionInputs } from "../../../types";

export class LegacyRecordService extends PaginatedService {
  defaultTypename = "legacyRecord";

  filterFieldsMap = {
    id: {},
    email: {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
  };

  searchFieldsMap = {};

  groupByFieldsMap = {};

  accessControl: AccessControlMap = {
    /*
    Allow if:
    - Email is not a requested field
    */
    get: async ({ query }) => {
      if (query?.email) return false;

      return true;
    },

    /*
    Allow if:
    - Email is not a requested field
    */
    getMultiple: ({ query }) => {
      if (query?.email) return false;

      return true;
    },
  };
}
