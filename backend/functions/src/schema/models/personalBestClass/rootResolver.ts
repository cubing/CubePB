import { PersonalBestClass } from "../../services";
import { generateBaseRootResolvers } from "../../core/helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(PersonalBestClass, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
