import { PersonalBest } from "../../services";
import { generateBaseRootResolvers } from "../../helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(PersonalBest, [
    "get",
    "getMultiple",
    "delete",
    "create",
    // "update",
  ]),
};
