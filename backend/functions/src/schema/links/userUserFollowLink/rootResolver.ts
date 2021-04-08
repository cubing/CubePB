import { UserUserFollowLink } from "../../services";
import { generateBaseRootResolvers } from "../../core/helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(UserUserFollowLink, [
    "getMultiple",
    "delete",
    "create",
  ]),
};
