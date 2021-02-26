import { Product } from "../../services";
import { generateBaseRootResolvers } from "../../helpers/rootResolver";

export default {
  ...generateBaseRootResolvers(Product, [
    "get",
    "getMultiple",
    "delete",
    "create",
    "update",
  ]),
};
