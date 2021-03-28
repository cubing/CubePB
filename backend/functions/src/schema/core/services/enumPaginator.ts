import { EnumService, SimpleService } from ".";
import { generateEnumPaginatorTypeDef } from "../generators";
import { GiraffeqlObjectType } from "giraffeql";

export class EnumPaginatorService extends SimpleService {
  constructor(service: EnumService) {
    super(service.typename + "EnumPaginator");
    this.presets = {
      default: {
        values: true,
      },
    };

    this.setTypeDef(
      new GiraffeqlObjectType(generateEnumPaginatorTypeDef(service, this))
    );
  }
}
