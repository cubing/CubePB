import { PaginatedService } from "../../core/services";
import { permissionsCheck } from "../../helpers/permissions";
import * as Resolver from "../../helpers/resolver";
import * as sqlHelper from "../../helpers/sql";
import { ServiceFunctionInputs } from "../../../types";
import { JomqlBaseError } from "jomql";
import { scoreMethodEnum } from "../../enums";

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
    is_current: {},
    set_size: {},
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
    is_current: {},
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
            filterObject["created_by.is_public"]?.eq === true ||
            filterObject["created_by.id"]?.eq === req.user?.id
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

    // get event.score_method
    const eventRecords = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "score_method",
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

    let score;
    switch (scoreMethodEnum.fromName(event.score_method)) {
      case scoreMethodEnum.STANDARD:
        // only use time_elapsed, all other fields null
        if (!validatedArgs.time_elapsed) {
          throw new JomqlBaseError({
            message: `This event requires time_elapsed`,
            fieldPath,
          });
        }

        // time_elapsed must be positive integer
        if (validatedArgs.time_elapsed <= 0)
          throw new JomqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        validatedArgs.attempts_total = null;
        validatedArgs.attempts_succeeded = null;
        validatedArgs.moves_count = null;
        score = validatedArgs.time_elapsed;
        break;
      case scoreMethodEnum.FMC:
        // only use moves_count, all other fields null
        if (!validatedArgs.moves_count) {
          throw new JomqlBaseError({
            message: `This event requires moves_count`,
            fieldPath,
          });
        }

        validatedArgs.attempts_total = null;
        validatedArgs.attempts_succeeded = null;
        validatedArgs.time_elapsed = null;
        score = validatedArgs.moves_count;
        break;
      case scoreMethodEnum.MBLD:
        // only use moves_count, all other fields null
        if (
          !validatedArgs.attempts_total ||
          !validatedArgs.attempts_succeeded ||
          !validatedArgs.time_elapsed
        ) {
          throw new JomqlBaseError({
            message: `This event requires attempts_total, attempts_succeeded, time_elapsed`,
            fieldPath,
          });
        }

        // time_elapsed must be positive integer
        if (validatedArgs.time_elapsed <= 0)
          throw new JomqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        // time_elapsed must be positive integer
        if (validatedArgs.attempts_total <= 0)
          throw new JomqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        // attempts_succeeded must be <= attempts_total
        if (validatedArgs.attempts_succeeded > validatedArgs.attempts_total) {
          throw new JomqlBaseError({
            message: `Attempts Succeeded cannot be greater than Attempts Total`,
            fieldPath,
          });
        }

        validatedArgs.moves_count = null;
        score =
          validatedArgs.time_elapsed *
          ((validatedArgs.attempts_total - validatedArgs.attempts_succeeded) *
            -1 +
            validatedArgs.attempts_succeeded * 1);
        break;
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

    // check scores of same event-pb_class-set_size-created_by
    // before the happened_on time
    const beforePbs = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "score",
        },
        {
          field: "is_current",
        },
      ],
      from: this.typename,
      where: {
        connective: "AND",
        fields: [
          {
            field: "happened_on",
            operator: "lt",
            value: validatedArgs.happened_on,
          },
          {
            field: "event.id",
            value: validatedArgs.event,
          },
          {
            field: "pb_class.id",
            value: validatedArgs.pb_class,
          },
          {
            field: "set_size",
            value: validatedArgs.set_size,
          },
          {
            field: "created_by.id",
            value: req.user!.id,
          },
        ],
      },
      orderBy: [
        {
          field: "happened_on",
          desc: true,
        },
      ],
      limit: 1,
    });

    let isCurrentPb = false;

    if (beforePbs.length > 0) {
      // if there were any before this one, check the score
      // current score must be greater than this
      if (score >= beforePbs[0].score) {
        throw new JomqlBaseError({
          message: `Score must be better than preceding scores`,
          fieldPath,
        });
      }

      if (beforePbs[0].is_current) {
        isCurrentPb = true;
      }
    }

    // if isCurrentPb === false, check future pbs
    const afterPbs = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "score",
        },
      ],
      from: this.typename,
      where: {
        connective: "AND",
        fields: [
          {
            field: "happened_on",
            operator: "gt",
            value: validatedArgs.happened_on,
          },
          {
            field: "event.id",
            value: validatedArgs.event,
          },
          {
            field: "pb_class.id",
            value: validatedArgs.pb_class,
          },
          {
            field: "set_size",
            value: validatedArgs.set_size,
          },
          {
            field: "created_by.id",
            value: req.user!.id,
          },
        ],
      },
      orderBy: [
        {
          field: "happened_on",
          desc: false,
        },
      ],
      limit: 1,
    });

    if (afterPbs.length > 0) {
      // if there were any after this one, check the score
      // current score must be less than this
      if (score <= afterPbs[0].score) {
        throw new JomqlBaseError({
          message: `Score must be worse than future scores`,
          fieldPath,
        });
      }
    } else {
      // if no future PBs, set isCurrentPb to true
      isCurrentPb = true;
    }

    // if the new PB is the current one and at least 1 preceding PB, set all others to false first
    if (isCurrentPb && beforePbs.length > 0) {
      await sqlHelper.updateTableRow(
        this.typename,
        {
          is_current: false,
        },
        {
          fields: [
            {
              field: "event",
              value: validatedArgs.event,
            },
            {
              field: "pb_class",
              value: validatedArgs.pb_class,
            },
            {
              field: "set_size",
              value: validatedArgs.set_size,
            },
            {
              field: "created_by",
              value: req.user!.id,
            },
            {
              field: "is_current",
              value: true,
            },
          ],
        },
        fieldPath
      );
    }

    await this.handleLookupArgs(validatedArgs, fieldPath);

    const addResults = await Resolver.createObjectType({
      typename: this.typename,
      addFields: {
        ...validatedArgs,
        score,
        is_current: isCurrentPb,
        created_by: req.user!.id,
      },
      req,
      fieldPath,
      /*       options: {
        onConflict: {
          columns: ["pb_class", "event", "set_size", "created_by"],
          action: "merge",
        },
      }, */
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

  @permissionsCheck("delete")
  async deleteRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;
    // confirm existence of item and get ID
    const results = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "is_current",
        },
        {
          field: "happened_on",
        },
      ],
      from: this.typename,
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (results.length < 1) {
      throw new Error(`${this.typename} not found`);
    }

    const itemId = results[0].id;

    // if this pb is_current === true, must set the previous pb to is_current
    if (results[0].is_current) {
      const previousPbResults = await sqlHelper.fetchTableRows({
        select: [
          {
            field: "id",
          },
        ],
        from: this.typename,
        where: {
          fields: [
            {
              field: "happened_on",
              operator: "lt",
              value: results[0].happened_on,
            },
          ],
        },
        orderBy: [
          {
            field: "happened_on",
            desc: true,
          },
        ],
        limit: 1,
      });

      if (previousPbResults.length > 0) {
        await sqlHelper.updateTableRow(
          this.typename,
          {
            is_current: true,
          },
          {
            fields: [
              {
                field: "id",
                value: previousPbResults[0].id,
              },
            ],
          }
        );
      }
    }

    // first, fetch the requested query, if any
    const requestedResults = await this.getRecord({
      req,
      args,
      query,
      fieldPath,
      isAdmin,
      data,
    });

    await Resolver.deleteObjectType({
      typename: this.typename,
      id: itemId,
      req,
      fieldPath,
    });

    return requestedResults;
  }
}
