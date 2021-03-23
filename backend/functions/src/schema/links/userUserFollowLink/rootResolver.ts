import { UserUserFollowLink } from "../../services";
import { generateBaseRootResolvers } from "../../helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(UserUserFollowLink, [
    "getMultiple",
    "delete",
    "create",
  ]),
};
