import { PaginatedService } from "../../core/services";
import { permissionsCheck } from "../../core/helpers/permissions";
import * as Resolver from "../../core/helpers/resolver";
import * as sqlHelper from "../../core/helpers/sql";
import { AccessControlMap, ServiceFunctionInputs } from "../../../types";
import { GiraffeqlBaseError } from "giraffeql";
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
    "createdBy.userUserFollowLink/user.id": {},
    isFlagged: {},
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

  accessControl: AccessControlMap = {
    get: async ({ args, fieldPath }) => {
      // check the createdBy.isPublic to see if true
      const result = await this.lookupRecord(
        ["createdBy.isPublic"],
        args,
        fieldPath
      );
      return result["createdBy.isPublic"] === true;
    },

    getMultiple: ({ req, args, query }) => {
      // not allowing querying for ranks in this view, as the query will be too costly
      if (
        query &&
        Object.keys(<any>query).some((field) => ["ranking"].includes(field))
      ) {
        return false;
      }

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

    update: async ({ req, args, fieldPath }) => {
      // can only update certain field as non-admin
      if (
        Object.keys(args.fields).some(
          (field) => !["publicComments", "product"].includes(field)
        )
      ) {
        return false;
      }

      // must be creator of the PB to update it
      const result = await this.lookupRecord(
        ["createdBy.id"],
        args.item,
        fieldPath
      );
      return req.user?.id === result["createdBy.id"];
    },

    delete: async ({ req, args, fieldPath }) => {
      // must be creator of the PB to delete it
      const result = await this.lookupRecord(["createdBy.id"], args, fieldPath);
      return req.user?.id === result["createdBy.id"];
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

    // if happenedOn is null, set it to current unix timestamp
    if (!validatedArgs.happenedOn) {
      validatedArgs.happenedOn = new Date().getTime() / 1000;
    }

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
      throw new GiraffeqlBaseError({
        message: `Event not found`,
        fieldPath,
      });

    const event = eventRecords[0];

    let score;
    switch (scoreMethodEnum.fromName(event.scoreMethod)) {
      case scoreMethodEnum.STANDARD:
        // only use timeElapsed, all other fields null
        if (!validatedArgs.timeElapsed) {
          throw new GiraffeqlBaseError({
            message: `This event requires timeElapsed`,
            fieldPath,
          });
        }

        // timeElapsed must be positive integer
        if (validatedArgs.timeElapsed <= 0)
          throw new GiraffeqlBaseError({
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
          throw new GiraffeqlBaseError({
            message: `This event requires movesCount`,
            fieldPath,
          });
        }

        validatedArgs.attemptsTotal = null;
        validatedArgs.attemptsSucceeded = null;
        validatedArgs.timeElapsed = null;
        score = validatedArgs.movesCount * 1000;
        break;
      case scoreMethodEnum.MBLD:
        // only use movesCount, all other fields null
        if (
          !validatedArgs.attemptsTotal ||
          !validatedArgs.attemptsSucceeded ||
          !validatedArgs.timeElapsed
        ) {
          throw new GiraffeqlBaseError({
            message: `This event requires attemptsTotal, attemptsSucceeded, timeElapsed`,
            fieldPath,
          });
        }

        // timeElapsed must be positive integer
        if (validatedArgs.timeElapsed <= 0)
          throw new GiraffeqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        // timeElapsed must be positive integer
        if (validatedArgs.attemptsTotal <= 0)
          throw new GiraffeqlBaseError({
            message: `Time elapsed must be positive`,
            fieldPath,
          });

        // attemptsSucceeded must be <= attemptsTotal
        if (validatedArgs.attemptsSucceeded > validatedArgs.attemptsTotal) {
          throw new GiraffeqlBaseError({
            message: `Attempts Succeeded cannot be greater than Attempts Total`,
            fieldPath,
          });
        }

        validatedArgs.movesCount = null;
        // rightmost 7 rights are for time (), lower is better
        // remaining digits are for the score (x -1*1E7), higher is better
        score =
          validatedArgs.timeElapsed +
          -10000000 *
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
      throw new GiraffeqlBaseError({
        message: `PersonalBestClass not found`,
        fieldPath,
      });

    const pbClass = pbClassRecords[0];

    // setSize must be 1 or greater
    if (validatedArgs.setSize < 1) {
      throw new GiraffeqlBaseError({
        message: `setSize must be 1 or greater`,
        fieldPath,
      });
    }

    // if pbClass.setSize, args.setSize must be equal to that
    if (pbClass.setSize !== null && pbClass.setSize !== validatedArgs.setSize) {
      throw new GiraffeqlBaseError({
        message: `Invalid setSize for this PersonalBestClass`,
        fieldPath,
      });
    }

    // if pbClass.setSize === null, args.setSize must be gt 1
    if (pbClass.setSize === null && validatedArgs.setSize <= 1) {
      throw new GiraffeqlBaseError({
        message: `setSize must be greater than 1 for this pbClass`,
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
        throw new GiraffeqlBaseError({
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
        throw new GiraffeqlBaseError({
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

  @permissionsCheck("flag")
  async flagRecord({
    req,
    fieldPath,
    args,
    query,
    data = {},
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;

    const item = await this.lookupRecord(["id"], validatedArgs.item, fieldPath);

    // convert any lookup/joined fields into IDs
    await this.handleLookupArgs(validatedArgs.fields, fieldPath);

    await Resolver.updateObjectType({
      typename: this.typename,
      id: item.id,
      updateFields: {
        isFlagged: true,
        updatedAt: 1,
      },
      req,
      fieldPath,
    });

    const returnData = await this.getRecord({
      req,
      args: { id: item.id },
      query,
      fieldPath,
      isAdmin,
      data,
    });

    return returnData;
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
    const item = await this.lookupRecord(
      [
        "id",
        "pbClass",
        "setSize",
        "createdBy",
        "isCurrent",
        "happenedOn",
        "event",
      ],
      validatedArgs,
      fieldPath
    );

    // if this pb isCurrent === true, must set the previous pb of the same event-pbClass-setSize-createdBy combination to isCurrent
    if (item.isCurrent) {
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
              value: item.happenedOn,
            },
            {
              field: "event",
              value: item.event,
            },
            {
              field: "pbClass",
              value: item.pbClass,
            },
            {
              field: "setSize",
              value: item.setSize,
            },
            {
              field: "createdBy",
              value: item.createdBy,
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
      id: item.id,
      req,
      fieldPath,
    });

    return requestedResults;
  }
}
