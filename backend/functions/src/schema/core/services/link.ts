import { NormalService } from ".";
import { generateLinkTypeDef } from "../generators";
import { linkDefs } from "../../links";
import { GiraffeqlObjectType } from "giraffeql";
import { PaginatedService } from "./paginated";

type ServicesObjectMap = {
  [x: string]: {
    allowNull?: boolean;
    service: NormalService;
  };
};

type JoinFieldMap = {
  [x: string]: string;
};

export class LinkService extends PaginatedService {
  servicesObjectMap: ServicesObjectMap;

  // when joining this table from X table, must join on this key
  joinFieldMap: JoinFieldMap;

  constructor(
    servicesObjectMap: ServicesObjectMap,
    joinFieldMap: JoinFieldMap,
    generateTypeDef = true,
    name?: string
  ) {
    super(name);
    this.servicesObjectMap = servicesObjectMap;
    this.joinFieldMap = joinFieldMap;
    if (generateTypeDef) {
      this.typeDef = new GiraffeqlObjectType(
        generateLinkTypeDef(servicesObjectMap, this)
      );
    }

    // register linkDef
    linkDefs.set(this.typename, this);
  }
}
