import { PaginatedService } from "../../core/services";
import { permissionsCheck } from "../../helpers/permissions";
import * as Resolver from "../../helpers/resolver";
import * as sqlHelper from "../../helpers/sql";
import { ServiceFunctionInputs } from "../../../types";
import { JomqlBaseError } from "jomql";

export class PersonalBestService extends PaginatedService {
  defaultTypename = "personalBest";

  filterFieldsMap = {
    id: {},
    "created_by.id": {},
    "created_by.is_public": {},
    "product.id": {},
    "event.id": {},
    "pb_class.id": {},
    happened_on: {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
    created_at: {},
    score: {},
    "event.name": {},
    "pb_class.name": {},
    set_size: {},
    time_elapsed: {},
    happened_on: {},
  };

  searchFieldsMap = {
    name: {},
  };

  groupByFieldsMap = {};

  accessControl = {
    get: async ({ args, fieldPath }) => {
      // check the created_by.is_public to see if true
      const result = await this.lookupRecord(
        [
          {
            field: "created_by.is_public",
          },
        ],
        args,
        fieldPath
      );
      return result["created_by.is_public"] === true;
    },

    getMultiple: ({ req, args }) => {
      // filterBy must have created_by.is_public === true
      // OR filterBy must have created_by.id === req.user.id
      if (
        Array.isArray(args.filterBy) &&
        args.filterBy.length > 0 &&
        args.filterBy.every((filterObject) => {
          return (
            filterObject["created_by.is_public"].eq === true ||
            filterObject["created_by.id"] === req.user?.id
          );
        })
      ) {
        return true;
      }

      return false;
    },

    delete: async ({ req, args, fieldPath }) => {
      // must be creator of the PB to delete it
      const result = await this.lookupRecord(
        [
          {
            field: "created_by.id",
          },
        ],
        args,
        fieldPath
      );
      return req.user.id === result["created_by.id"];
    },
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

    // time_elapsed must be positive integer
    if (validatedArgs.time_elapsed <= 0)
      throw new JomqlBaseError({
        message: `Time elapsed must be positive`,
        fieldPath,
      });

    // get event.max_attempts
    const eventRecords = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "max_attempts",
        },
      ],
      from: "event",
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs.event).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (eventRecords.length < 1)
      throw new JomqlBaseError({
        message: `Event not found`,
        fieldPath,
      });

    const event = eventRecords[0];

    // attempts_total must be <= event.max_attempts
    if (validatedArgs.attempts_total > event.max_attempts)
      throw new JomqlBaseError({
        message: `This event allows a maximum of ${event.max_attempts} total attempts`,
        fieldPath,
      });

    // attempts_succeeded must be <= attempts_total
    if (validatedArgs.attempts_succeeded > validatedArgs.attempts_total) {
      throw new JomqlBaseError({
        message: `Attempts Succeeded cannot be greater than Attempts Total`,
        fieldPath,
      });
    }

    // get pb_class.set_size
    const pbClassRecords = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "set_size",
        },
      ],
      from: "personalBestClass",
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs.pb_class).map(
          ([field, value]) => ({
            field,
            value,
          })
        ),
      },
    });

    if (pbClassRecords.length < 1)
      throw new JomqlBaseError({
        message: `PersonalBestClass not found`,
        fieldPath,
      });

    const pbClass = pbClassRecords[0];

    // if pb_class.set_size, args.set_size must be equal to that
    if (
      pbClass.set_size !== null &&
      pbClass.set_size !== validatedArgs.set_size
    ) {
      throw new JomqlBaseError({
        message: `Invalid set size for this PersonalBestClass`,
        fieldPath,
      });
    }

    // set this now to save the work in handleLookupArgs
    validatedArgs.event = event.id;
    validatedArgs.pb_class = pbClass.id;

    await this.handleLookupArgs(validatedArgs, fieldPath);

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
      options: {
        onConflict: {
          columns: ["pb_class", "event", "set_size", "created_by"],
          action: "merge",
        },
      },
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
}
