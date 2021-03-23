import { NormalService } from ".";
import { generateLinkTypeDef } from "../generators";
import { linkDefs } from "../../links";
import { JomqlObjectType } from "jomql";
import { PaginatedService } from "./paginated";

type ServicesObjectMap = {
  [x: string]: NormalService;
};

export class LinkService extends PaginatedService {
  servicesObjectMap: ServicesObjectMap;

  constructor(
    servicesObjectMap: ServicesObjectMap,
    generateTypeDef = true,
    name?: string
  ) {
    super(name);
    this.servicesObjectMap = servicesObjectMap;
    if (generateTypeDef) {
      this.typeDef = new JomqlObjectType(
        generateLinkTypeDef(servicesObjectMap, this)
      );
    }

    const servicesMap: Map<string, NormalService> = new Map();

    for (const field in servicesObjectMap) {
      servicesMap.set(field, servicesObjectMap[field]);
    }

    // register linkDef
    linkDefs.set(this.typename, {
      types: servicesMap,
      service: this,
    });
  }
}
