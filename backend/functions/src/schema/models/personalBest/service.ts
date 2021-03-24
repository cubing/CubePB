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
    "createdBy.id": {},
    "createdBy.isPublic": {},
    "product.id": {},
    "event.id": {},
    "pbClass.id": {},
    happenedOn: {},
    isCurrent: {},
    setSize: {},
  };

  uniqueKeyMap = {
    primary: ["id"],
  };

  sortFieldsMap = {
    id: {},
    createdAt: {},
    score: {},
    "event.name": {},
    "pbClass.name": {},
    setSize: {},
    timeElapsed: {},
    happenedOn: {},
    isCurrent: {},
  };

  searchFieldsMap = {
    name: {},
  };

  groupByFieldsMap = {};

  accessControl = {
    get: async ({ args, fieldPath }) => {
      // check the createdBy.isPublic to see if true
      const result = await this.lookupRecord(
        [
          {
            field: "createdBy.isPublic",
          },
        ],
        args,
        fieldPath
      );
      return result["createdBy.isPublic"] === true;
    },

    getMultiple: ({ req, args }) => {
      // filterBy must have createdBy.isPublic === true
      // OR filterBy must have createdBy.id === req.user.id
      if (
        Array.isArray(args.filterBy) &&
        args.filterBy.length > 0 &&
        args.filterBy.every((filterObject) => {
          return (
            filterObject["createdBy.isPublic"]?.eq === true ||
            filterObject["createdBy.id"]?.eq === req.user?.id
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
            field: "createdBy.id",
          },
        ],
        args,
        fieldPath
      );
      return req.user.id === result["createdBy.id"];
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

    // get event.scoreMethod
    const eventRecords = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "scoreMethod",
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
    switch (scoreMethodEnum.fromName(event.scoreMethod)) {
      case scoreMethodEnum.STANDARD:
        // only use timeElapsed, all other fields null
        if (!validatedArgs.timeElapsed) {
          throw new JomqlBaseError({
            message: `This event requires timeElapsed`,
            fieldPath,
          });
        }

        // timeElapsed must be positive integer
        if (validatedArgs.timeElapsed <= 0)
          throw new JomqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        validatedArgs.attemptsTotal = null;
        validatedArgs.attemptsSucceeded = null;
        validatedArgs.movesCount = null;
        score = validatedArgs.timeElapsed;
        break;
      case scoreMethodEnum.FMC:
        // only use movesCount, all other fields null
        if (!validatedArgs.movesCount) {
          throw new JomqlBaseError({
            message: `This event requires movesCount`,
            fieldPath,
          });
        }

        validatedArgs.attemptsTotal = null;
        validatedArgs.attemptsSucceeded = null;
        validatedArgs.timeElapsed = null;
        score = validatedArgs.movesCount;
        break;
      case scoreMethodEnum.MBLD:
        // only use movesCount, all other fields null
        if (
          !validatedArgs.attemptsTotal ||
          !validatedArgs.attemptsSucceeded ||
          !validatedArgs.timeElapsed
        ) {
          throw new JomqlBaseError({
            message: `This event requires attemptsTotal, attemptsSucceeded, timeElapsed`,
            fieldPath,
          });
        }

        // timeElapsed must be positive integer
        if (validatedArgs.timeElapsed <= 0)
          throw new JomqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        // timeElapsed must be positive integer
        if (validatedArgs.attemptsTotal <= 0)
          throw new JomqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        // attemptsSucceeded must be <= attemptsTotal
        if (validatedArgs.attemptsSucceeded > validatedArgs.attemptsTotal) {
          throw new JomqlBaseError({
            message: `Attempts Succeeded cannot be greater than Attempts Total`,
            fieldPath,
          });
        }

        validatedArgs.movesCount = null;
        score =
          validatedArgs.timeElapsed *
          ((validatedArgs.attemptsTotal - validatedArgs.attemptsSucceeded) *
            -1 +
            validatedArgs.attemptsSucceeded * 1);
        break;
    }

    // get pbClass.setSize
    const pbClassRecords = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "setSize",
        },
      ],
      from: "personalBestClass",
      where: {
        connective: "AND",
        fields: Object.entries(validatedArgs.pbClass).map(([field, value]) => ({
          field,
          value,
        })),
      },
    });

    if (pbClassRecords.length < 1)
      throw new JomqlBaseError({
        message: `PersonalBestClass not found`,
        fieldPath,
      });

    const pbClass = pbClassRecords[0];

    // if pbClass.setSize, args.setSize must be equal to that
    if (pbClass.setSize !== null && pbClass.setSize !== validatedArgs.setSize) {
      throw new JomqlBaseError({
        message: `Invalid set size for this PersonalBestClass`,
        fieldPath,
      });
    }

    // set this now to save the work in handleLookupArgs
    validatedArgs.event = event.id;
    validatedArgs.pbClass = pbClass.id;

    // check scores of same event-pbClass-setSize-createdBy
    // before the happenedOn time
    const beforePbs = await sqlHelper.fetchTableRows({
      select: [
        { field: "id" },
        {
          field: "score",
        },
        {
          field: "isCurrent",
        },
      ],
      from: this.typename,
      where: {
        connective: "AND",
        fields: [
          {
            field: "happenedOn",
            operator: "lte",
            value: validatedArgs.happenedOn,
          },
          {
            field: "event.id",
            value: validatedArgs.event,
          },
          {
            field: "pbClass.id",
            value: validatedArgs.pbClass,
          },
          {
            field: "setSize",
            value: validatedArgs.setSize,
          },
          {
            field: "createdBy.id",
            value: req.user!.id,
          },
        ],
      },
      orderBy: [
        {
          field: "happenedOn",
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

      if (beforePbs[0].isCurrent) {
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
            field: "happenedOn",
            operator: "gte",
            value: validatedArgs.happenedOn,
          },
          {
            field: "event.id",
            value: validatedArgs.event,
          },
          {
            field: "pbClass.id",
            value: validatedArgs.pbClass,
          },
          {
            field: "setSize",
            value: validatedArgs.setSize,
          },
          {
            field: "createdBy.id",
            value: req.user!.id,
          },
        ],
      },
      orderBy: [
        {
          field: "happenedOn",
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
        {
          table: this.typename,
          fields: {
            isCurrent: false,
          },
          where: {
            fields: [
              {
                field: "event",
                value: validatedArgs.event,
              },
              {
                field: "pbClass",
                value: validatedArgs.pbClass,
              },
              {
                field: "setSize",
                value: validatedArgs.setSize,
              },
              {
                field: "createdBy",
                value: req.user!.id,
              },
              {
                field: "isCurrent",
                value: true,
              },
            ],
          },
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
        isCurrent: isCurrentPb,
        createdBy: req.user!.id,
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
          field: "isCurrent",
        },
        {
          field: "happenedOn",
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

    // if this pb isCurrent === true, must set the previous pb to isCurrent
    if (results[0].isCurrent) {
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
              field: "happenedOn",
              operator: "lt",
              value: results[0].happenedOn,
            },
          ],
        },
        orderBy: [
          {
            field: "happenedOn",
            desc: true,
          },
        ],
        limit: 1,
      });

      if (previousPbResults.length > 0) {
        await sqlHelper.updateTableRow(
          {
            table: this.typename,
            fields: {
              isCurrent: true,
            },
            where: {
              fields: [
                {
                  field: "id",
                  value: previousPbResults[0].id,
                },
              ],
            },
          },
          fieldPath
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
