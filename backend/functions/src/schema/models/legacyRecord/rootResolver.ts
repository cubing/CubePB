import { LegacyRecord } from "../../services";
import { generateBaseRootResolvers } from "../../core/helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(LegacyRecord, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
