import { ApiKey } from "../../services";
import { generateBaseRootResolvers } from "../../core/helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(ApiKey, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
