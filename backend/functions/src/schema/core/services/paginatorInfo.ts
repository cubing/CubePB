import { NormalService, SimpleService } from ".";
import * as Resolver from "../helpers/resolver";
import { itemNotFoundError } from "../helpers/error";
import { generatePaginatorInfoTypeDef } from "../generators";
import { ServiceFunctionInputs } from "../../../types";
import { lookupSymbol, GiraffeqlObjectType } from "giraffeql";

export class PaginatorInfoService extends SimpleService {
  constructor(service: NormalService) {
    super("paginatorInfo");
    this.typeDef = new GiraffeqlObjectType(
      generatePaginatorInfoTypeDef(service, this),
      true
    );
    this.presets = {
      default: {
        "*": lookupSymbol,
      },
    };

    this.getRecord = async ({
      req,
      fieldPath,
      args,
      query,
      data = {},
      isAdmin = false,
    }: ServiceFunctionInputs) => {
      const selectQuery = query || Object.assign({}, this.presets.default);

      const results = await Resolver.getObjectType({
        typename: this.typename,
        req,
        fieldPath,
        externalQuery: selectQuery,
        data,
        externalTypeDef: this.typeDef, // must pass the specific typeDef for this Paginator
      });

      if (results.length < 1) {
        throw itemNotFoundError(fieldPath);
      }

      return results[0];
    };
  }
}
