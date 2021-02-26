import { Event } from "../../services";
import { generateBaseRootResolvers } from "../../helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(Event, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
