import { PaginatedService } from "../../core/services";
import { generateUserRoleGuard } from "../../helpers/permissions";
import { userRoleKenum } from "../../enums";
import { permissionsCheck } from "../../helpers/permissions";
import * as Resolver from "../../helpers/resolver";
import * as errorHelper from "../../helpers/error";
import * as sqlHelper from "../../helpers/sql";
import { ServiceFunctionInputs } from "../../../types";

export class PersonalBestService extends PaginatedService {
  defaultTypename = "personalBest";

  filterFieldsMap = {
    id: {},
    "created_by.id": {},
    "product.id": {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
    created_at: {},
    score: {},
  };

  searchFieldsMap = {
    name: {},
  };

  groupByFieldsMap = {};

  accessControl = {
    get: () => true,

    getMultiple: () => true,

    update: generateUserRoleGuard([userRoleKenum.ADMIN]),
    create: generateUserRoleGuard([userRoleKenum.ADMIN]),
    delete: generateUserRoleGuard([userRoleKenum.ADMIN]),
  };

  @permissionsCheck("create")
  async createRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    await this.handleLookupArgs(args, fieldPath);

    // calculate the score based on time, attempts_total, and attempts_succeeded
    const score =
      validatedArgs.time_elapsed *
      ((validatedArgs.attempts_total - validatedArgs.attempts_succeeded) * -1 +
        validatedArgs.attempts_succeeded * 1);

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        ...validatedArgs,
        score,
        created_by: req.user!.id,
      },
      req,
      fieldPath,
    });

    return this.getRecord({
      req,
      args: { id: addResults.id },
      query,
      fieldPath,
      isAdmin,
      data,
    });
  }

  @permissionsCheck("update")
  async updateRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    // check if record exists, get ID
    // also fetching all fields involved in calculating score
    const records = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "time_elapsed",
        },
        {
          field: "attempts_total",
        },
        {
          field: "attempts_succeeded",
        },
      ],
      from: this.typename,
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs.item).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (records.length < 1) {
      throw errorHelper.itemNotFoundError(fieldPath);
    }

    const itemId = records[0].id;
    const item = records[0];

    // convert any lookup/joined fields into IDs
    await this.handleLookupArgs(validatedArgs.fields, fieldPath);

    // merge update args into record
    Object.assign(item, validatedArgs.fields);

    // calculate the score based on time, attempts_total, and attempts_succeeded
    const score =
      item.time_elapsed *
      ((item.attempts_total - item.attempts_succeeded) * -1 +
        item.attempts_succeeded * 1);

    await Resolver.updateObjectType({
      typename: this.typename,
      id: itemId,
      updateFields: {
        ...validatedArgs.fields,
        score,
        updated_at: 1,
      },
      req,
      fieldPath,
    });

    const returnData = await this.getRecord({
      req,
      args: { id: itemId },
      query,
      fieldPath,
      isAdmin,
      data,
    });

    return returnData;
  }
}
