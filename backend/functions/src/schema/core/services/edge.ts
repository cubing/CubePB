import { NormalService, SimpleService } from ".";
import { generateEdgeTypeDef } from "../generators";
import { lookupSymbol, GiraffeqlObjectType } from "giraffeql";

export class EdgeService extends SimpleService {
  constructor(service: NormalService) {
    super(service.typename + "Edge");
    this.typeDef = new GiraffeqlObjectType(generateEdgeTypeDef(service, this));
    this.presets = {
      default: {
        "*": lookupSymbol,
      },
    };
  }
}
