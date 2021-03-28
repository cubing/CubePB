import {
  generateAnonymousRootResolver,
  generateGiraffeqlResolverTree,
  processGiraffeqlResolverTree,
  GiraffeqlResolverNode,
  GiraffeqlObjectType,
  objectTypeDefs,
  GiraffeqlObjectTypeLookup,
  isRootResolverDefinition,
  GiraffeqlBaseError,
} from "giraffeql";

import {
  insertTableRow,
  updateTableRow,
  deleteTableRow,
  fetchTableRows,
  countTableRows,
  KnexExtendFunction,
  SqlSelectQuery,
  SqlSelectQueryObject,
  SqlWhereObject,
} from "./sql";
import { CustomResolverFunction } from "../../types";

import { isObject } from "../helpers/shared";
import type { Request } from "express";

type CustomResolver = {
  resolver: CustomResolverFunction;
  value?: unknown;
};

type CustomResolverMap = {
  [x: string]: CustomResolver;
};

type SqlSelectQueryOutput = {
  [x: string]: any;
};

function collapseSqlOutput(obj: SqlSelectQueryOutput): SqlSelectQueryOutput {
  const returnObject = {};
  const nestedFieldsSet: Set<string> = new Set();

  for (const field in obj) {
    if (field.match(/\./)) {
      const firstPart = field.substr(0, field.indexOf("."));
      const secondPart = field.substr(field.indexOf(".") + 1);

      // if field is set as null, skip
      if (returnObject[firstPart] === null) continue;

      // if field not in return object as object, set it
      if (!isObject(returnObject[firstPart])) {
        returnObject[firstPart] = {};
        nestedFieldsSet.add(firstPart);
      }

      // if secondPart is "id", set it to null
      if (secondPart === "id" && obj[field] === null) {
        returnObject[firstPart] = null;
        nestedFieldsSet.delete(firstPart);
        continue;
      }

      returnObject[firstPart][secondPart] = obj[field];
    } else {
      // leaf field, add to obj if not already set
      if (!(field in returnObject)) returnObject[field] = obj[field];
    }
  }

  // process the fields that are nested
  nestedFieldsSet.forEach((field) => {
    returnObject[field] = collapseSqlOutput(returnObject[field]);
  });
  return returnObject;
}

function collapseSqlOutputArray(objArray: SqlSelectQueryOutput[]) {
  return objArray.map((obj) => collapseSqlOutput(obj));
}

//validates the add fields, and then does the add operation
export async function createObjectType({
  typename,
  req,
  fieldPath,
  addFields,
  extendFn,
}: {
  typename: string;
  req: Request;
  fieldPath: string[];
  addFields: { [x: string]: unknown };
  extendFn?: KnexExtendFunction;
}): Promise<any> {
  const typeDef = objectTypeDefs.get(typename);
  if (!typeDef) {
    throw new GiraffeqlBaseError({
      message: `Invalid typeDef '${typename}'`,
      fieldPath,
    });
  }

  // assemble the sql fields
  const sqlFields = {};

  // handle the custom setters
  const customResolvers: CustomResolverMap = {};

  for (const field in addFields) {
    if (!(field in typeDef.definition.fields)) {
      throw new GiraffeqlBaseError({
        message: `Invalid field`,
        fieldPath,
      });
    }

    // if it is a sql field, add to sqlFields
    if (typeDef.definition.fields[field].sqlOptions) {
      sqlFields[field] = addFields[field];
    }

    // if it has a custom updater, add to customResolvers
    const customResolver = typeDef.definition.fields[field].updater;
    if (customResolver) {
      customResolvers[field] = {
        resolver: customResolver,
        value: addFields[field],
      };
    }
  }

  let addedResults;

  // do the sql fields first, if any
  if (Object.keys(sqlFields).length > 0) {
    addedResults = await insertTableRow(
      {
        table: typename,
        fields: sqlFields,
        extendFn,
      },
      fieldPath
    );
  }

  const resultObject = addedResults ? addedResults[0] : {};

  // handle the custom setter functions, which might rely on id of created object
  for (const field in customResolvers) {
    await customResolvers[field].resolver(
      typename,
      req,
      customResolvers[field].value,
      resultObject
    );
  }

  return resultObject;
}

// validates the update fields, and then does the update operation
export async function updateObjectType({
  typename,
  req,
  fieldPath,
  updateFields,
  id,
}: {
  typename: string;
  req: Request;
  fieldPath: string[];
  updateFields: { [x: string]: unknown };
  id: number;
}): Promise<any> {
  const typeDef = objectTypeDefs.get(typename);
  if (!typeDef) {
    throw new GiraffeqlBaseError({
      message: `Invalid typeDef '${typename}'`,
      fieldPath,
    });
  }

  //assemble the sql fields
  const sqlFields = {};

  //handle the custom setters
  const customResolvers: CustomResolverMap = {};

  for (const field in updateFields) {
    if (!(field in typeDef.definition.fields)) {
      throw new GiraffeqlBaseError({
        message: `Invalid update field`,
        fieldPath,
      });
    }

    // if it is a sql field, add to sqlFields
    if (typeDef.definition.fields[field].sqlOptions) {
      sqlFields[field] = updateFields[field];
    }

    // if it has a custom updater, add to customResolvers
    const customResolver = typeDef.definition.fields[field].updater;
    if (customResolver) {
      customResolvers[field] = {
        resolver: customResolver,
        value: updateFields[field],
      };
    }
  }

  // do the sql first, if any fields
  if (Object.keys(sqlFields).length > 0) {
    await updateTableRow(
      {
        table: typename,
        fields: sqlFields,
        where: { fields: [{ field: "id", value: id }] },
      },
      fieldPath
    );
  }

  const resultObject = {
    id,
  };

  //handle the custom setter functions, which might rely on primary keys
  for (const field in customResolvers) {
    await customResolvers[field].resolver(
      typename,
      req,
      customResolvers[field].value,
      resultObject
    );
  }

  return resultObject;
}

// performs the delete operation
export async function deleteObjectType({
  typename,
  req,
  fieldPath,
  id,
}: {
  typename: string;
  req: Request;
  fieldPath: string[];
  id: number;
}): Promise<any> {
  //resolve the deleters
  const typeDef = objectTypeDefs.get(typename);
  if (!typeDef) {
    throw new GiraffeqlBaseError({
      message: `Invalid typeDef '${typename}'`,
      fieldPath,
    });
  }

  let hasSqlFields = false;

  //handle the custom deleters
  const customResolvers: CustomResolverMap = {};

  for (const field in typeDef.definition.fields) {
    // see if it has sql fields
    if (typeDef.definition.fields[field].sqlOptions && !hasSqlFields)
      hasSqlFields = true;

    // if it has a custom deleter, add to customResolvers
    const customResolver = typeDef.definition.fields[field].deleter;
    if (customResolver) {
      customResolvers[field] = {
        resolver: customResolver,
      };
    }
  }

  // do the sql first
  if (hasSqlFields)
    await deleteTableRow(
      {
        table: typename,
        where: { fields: [{ field: "id", value: id }] },
      },
      fieldPath
    );

  const resultObject = {
    id,
  };

  //handle the custom deleter functions, which might rely on primary keys
  for (const field in customResolvers) {
    await customResolvers[field].resolver(typename, req, null, resultObject);
  }

  return resultObject;
}

export async function getObjectType({
  typename,
  req,
  fieldPath,
  externalQuery,
  sqlParams,
  rawSelect = [],
  data = {},
  externalTypeDef,
}: {
  typename: string;
  req: Request;
  fieldPath: string[];
  externalQuery: unknown;
  sqlParams?: Omit<SqlSelectQuery, "from" | "select">;
  rawSelect?: SqlSelectQueryObject[];
  data?: any;
  externalTypeDef?: GiraffeqlObjectType;
}): Promise<unknown[]> {
  // shortcut: if no fields were requested, simply return empty object
  if (isObject(externalQuery) && Object.keys(externalQuery).length < 1)
    return [{}];

  const typeDef = objectTypeDefs.get(typename);
  if (!typeDef) {
    throw new GiraffeqlBaseError({
      message: `Invalid typeDef '${typename}'`,
      fieldPath,
    });
  }

  const anonymousRootResolver = generateAnonymousRootResolver(
    externalTypeDef ?? new GiraffeqlObjectTypeLookup(typename)
  );

  // build an anonymous root resolver
  const giraffeqlResolverTree = generateGiraffeqlResolverTree(
    externalQuery,
    anonymousRootResolver,
    fieldPath
  );

  // convert GiraffeqlResolverNode into a validatedSqlQuery
  const validatedSqlSelectArray = generateSqlQuerySelectObject({
    // should never end up in here without a nested query
    nestedResolverNodeMap: giraffeqlResolverTree.nested!,
    fieldPath,
  });

  let giraffeqlResultsTreeArray: SqlSelectQueryOutput[];

  // if no sql fields, skip
  if (validatedSqlSelectArray.length < 1) {
    giraffeqlResultsTreeArray = [{}];
  } else {
    if (!sqlParams)
      throw new GiraffeqlBaseError({
        message: `SQL Params required`,
        fieldPath,
      });
    const sqlQuery = {
      select: validatedSqlSelectArray.concat(rawSelect),
      from: typename,
      ...sqlParams,
    };

    giraffeqlResultsTreeArray = collapseSqlOutputArray(
      await fetchTableRows(sqlQuery, fieldPath)
    );
  }

  // finish processing GiraffeqlResolverNode by running the resolvers on the data fetched thru sql.
  const processedResultsTree = await Promise.all(
    giraffeqlResultsTreeArray.map((giraffeqlResultsTree) =>
      processGiraffeqlResolverTree({
        giraffeqlResultsNode: giraffeqlResultsTree,
        giraffeqlResolverNode: giraffeqlResolverTree,
        req,
        data,
        fieldPath,
      })
    )
  );

  // handle aggregated fields -- must be nested query. cannot be array of scalars like [1, 2, 3, 4] at the moment
  if (giraffeqlResolverTree.nested) {
    await handleAggregatedQueries({
      resultsArray: processedResultsTree,
      nestedResolverNodeMap: giraffeqlResolverTree.nested,
      req,
      data,
      fieldPath,
    });
  }

  return processedResultsTree;
}

export function countObjectType(
  typename: string,
  fieldPath: string[],
  whereObject: SqlWhereObject,
  distinct?: boolean
): Promise<number> {
  return countTableRows(
    {
      from: typename,
      where: whereObject,
      distinct,
    },
    fieldPath
  );
}

function generateSqlQuerySelectObject({
  nestedResolverNodeMap,
  parentFields = [],
  fieldPath,
}: {
  nestedResolverNodeMap: { [x: string]: GiraffeqlResolverNode };
  parentFields?: string[];
  fieldPath: string[];
}) {
  const sqlSelectObjectArray: {
    field: string;
  }[] = [];

  let addIdField = true;
  for (const field in nestedResolverNodeMap) {
    const typeDef = nestedResolverNodeMap[field].typeDef;
    // if root resolver object, skip (should never reach this case)
    if (isRootResolverDefinition(typeDef)) {
      continue;
    }

    const parentPlusCurrentField = parentFields.concat(field);
    const nested = nestedResolverNodeMap[field].nested;
    const sqlOptions = typeDef.sqlOptions;
    if (sqlOptions) {
      // if nested with no resolver and no dataloader, AND joinable
      if (
        nested &&
        !typeDef.resolver &&
        !typeDef.dataloader &&
        sqlOptions.joinType
      ) {
        sqlSelectObjectArray.push(
          ...generateSqlQuerySelectObject({
            nestedResolverNodeMap: nested,
            parentFields: parentPlusCurrentField,
            fieldPath,
          })
        );
      } else {
        // if not root level AND nestHidden, throw error
        if (parentFields.length && typeDef.nestHidden) {
          throw new GiraffeqlBaseError({
            message: `Requested field not allowed to be accessed directly in an nested context`,
            fieldPath: fieldPath.concat(parentPlusCurrentField),
          });
        } else {
          if (field === "id") addIdField = false;

          sqlSelectObjectArray.push({
            field: parentPlusCurrentField.join("."),
          });
        }
      }
    } else {
      // if no sqlOptions, still check if field is nestHidden
      if (parentFields.length && typeDef.nestHidden) {
        throw new GiraffeqlBaseError({
          message: `Requested field not allowed to be accessed directly in an nested context`,
          fieldPath: fieldPath.concat(parentPlusCurrentField),
        });
      }

      // also check to see if it has any requiredSqlFields
      if (typeDef.requiredSqlFields) {
        typeDef.requiredSqlFields.forEach((field) => {
          sqlSelectObjectArray.push({
            field: parentFields.concat(field).join("."),
          });
        });
      }
    }
  }

  // if any sql fields requested at this node and it is deeper than 0, add the id field
  if (
    sqlSelectObjectArray.length > 0 &&
    parentFields.length > 0 &&
    addIdField
  ) {
    sqlSelectObjectArray.push({
      field: parentFields.concat("id").join("."),
    });
  }

  return sqlSelectObjectArray;
}

async function handleAggregatedQueries({
  resultsArray,
  nestedResolverNodeMap,
  req,
  args,
  data,
  fieldPath = [],
}: {
  resultsArray: any[];
  nestedResolverNodeMap: { [x: string]: GiraffeqlResolverNode };
  req: Request;
  args?: unknown;
  data: any;
  fieldPath?: string[];
}): Promise<void> {
  for (const field in nestedResolverNodeMap) {
    const currentFieldPath = fieldPath.concat(field);
    // if root resolver object, skip (should never reach this case)
    const typeDef = nestedResolverNodeMap[field].typeDef;
    if (isRootResolverDefinition(typeDef)) {
      continue;
    }

    const dataloaderFn = typeDef.dataloader;
    const nestedResolver = nestedResolverNodeMap[field].nested;
    if (dataloaderFn && nestedResolverNodeMap[field].query) {
      const keySet = new Set();

      // aggregate ids
      resultsArray.forEach((result) => {
        if (result) keySet.add(result[field]);
      });

      // set ids in data
      data.idArray = [...keySet];

      // lookup all the ids
      const aggregatedResults = await dataloaderFn({
        req,
        args,
        query: nestedResolverNodeMap[field].query,
        currentObject: {},
        fieldPath: currentFieldPath,
        data,
      });

      // build id -> record map
      const recordMap = new Map();
      aggregatedResults.forEach((result: any) => {
        recordMap.set(result.id, result);
      });

      // join the records in memory
      resultsArray.forEach((result) => {
        if (result) result[field] = recordMap.get(result[field]);
      });
    } else if (nestedResolver) {
      // if field does not have a dataloader, it must be nested.
      // build the array of records that will need replacing and go deeper
      const nestedResultsArray = resultsArray.reduce((total: any[], result) => {
        if (result) total.push(result[field]);
        return total;
      }, []);

      await handleAggregatedQueries({
        resultsArray: nestedResultsArray,
        nestedResolverNodeMap: nestedResolver,
        req,
        args,
        data,
        fieldPath: currentFieldPath,
      });
    }
  }
}
