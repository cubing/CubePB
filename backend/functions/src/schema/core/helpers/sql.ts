/*
 * Purpose: execute raw SQL instructions while making use of the Giraffeql schema
 */

import {
  GiraffeqlBaseError,
  ObjectTypeDefinitionField,
  objectTypeDefs,
} from "giraffeql";
import Knex = require("knex");
import { isDev } from "../../../config";
import { executeDBQuery, knex } from "../../../utils/knex";
import { linkDefs } from "../../links";

type FieldInfo = {
  alias: string;
  tableAlias: string;
  finalField: string;
  fieldDef: ObjectTypeDefinitionField;
};

function isSqlWhereObject(
  obj: SqlWhereFieldObject | SqlWhereObject
): obj is SqlWhereObject {
  return (obj as SqlWhereObject).fields !== undefined;
}

export type SqlWhereObject = {
  connective?: string;
  fields: (SqlWhereObject | SqlWhereFieldObject)[];
};

export type SqlOrderByObject = {
  field: string;
  desc?: boolean;
};

export type SqlWhereFieldObject = {
  field: string;
  value: unknown;
  operator?: SqlWhereFieldOperator;
};

export type SqlSelectQueryObject = {
  field: string;
  as?: string;
};

export type SqlWhereFieldOperator =
  | "eq"
  | "neq"
  | "in"
  | "nin"
  | "regex"
  | "like"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export type SqlSelectQuery = {
  select: SqlSelectQueryObject[];
  from: string;
  where: SqlWhereObject;
  groupBy?: string[];
  orderBy?: SqlOrderByObject[];
  limit?: number;
  distinct?: boolean;
  specialParams?: any;
};

export type SqlCountQuery = {
  from: string;
  where: SqlWhereObject;
  limit?: number;
  distinct?: boolean;
  specialParams?: any;
};

export type SqlInsertQuery = {
  table: string;
  fields: {
    [x: string]: any;
  };
  extendFn?: KnexExtendFunction;
};

export type KnexExtendFunction = (knexObject: Knex.QueryBuilder) => void;

export type SqlUpdateQuery = {
  table: string;
  fields: {
    [x: string]: any;
  };
  where: SqlWhereObject;
  extendFn?: KnexExtendFunction;
};

export type SqlDeleteQuery = {
  table: string;
  where: SqlWhereObject;
  extendFn?: KnexExtendFunction;
};

function generateError(err: Error, fieldPath?: string[]) {
  const errMessage = isDev ? err.message : "A SQL error has occurred";
  console.log(err);
  return new GiraffeqlBaseError({
    message: errMessage,
    fieldPath,
  });
}

function extractFields(whereObject: SqlWhereObject): string[] {
  const fields: string[] = [];
  whereObject.fields.forEach((whereSubObject) => {
    if (isSqlWhereObject(whereSubObject)) {
      fields.push(...extractFields(whereSubObject));
    } else {
      fields.push(whereSubObject.field);
    }
  });

  return fields;
}

type JoinObject = {
  table: string;
  alias: string;
  field: string; // field from the originating table
  joinField: string; // field to be joined from joinedTable
  nested: {
    [x: string]: JoinObject;
  };
};

function acquireTableAlias(tableIndexMap: Map<string, number>, table) {
  // increment tableIndexMap
  let currentTableIndex = tableIndexMap.get(table) ?? -1;

  tableIndexMap.set(table, ++currentTableIndex);
  return table + currentTableIndex;
}

function processFields(relevantFields: Set<string>, table: string) {
  // get the typeDef
  const typeDef = objectTypeDefs.get(table);
  if (!typeDef) throw new Error(`TypeDef for ${table} not found`);

  const tableAlias = table + "0";

  // track required joins
  const requiredJoins: { [x: string]: JoinObject } = {};

  // map relevantFields to actual fields
  const fieldInfoMap: Map<string, FieldInfo> = new Map();
  // track table aliases
  const tableIndexMap: Map<string, number> = new Map();
  // set main table to index 0
  tableIndexMap.set(table, 0);

  // go through the relevant fields, build join statements
  relevantFields.forEach((field) => {
    // does the field have a "."? if so, must join
    const fieldParts = field.split(/\./);

    let currentTypeDef = typeDef;
    let currentTableAlias = tableAlias;
    let currentJoinObject = requiredJoins;

    fieldParts.forEach((fieldPart, index) => {
      // does the field have a "/"? if so, must handle differently
      let actualFieldPart = fieldPart;
      if (fieldPart.match(/\//)) {
        const subParts = fieldPart.split(/\//);
        const linkJoinType = subParts[0];

        // ensure the type exists
        const linkService = linkDefs.get(linkJoinType);
        if (!linkService)
          throw new Error(`Link type '${linkJoinType}' does not exist`);

        const linkJoinTypeDef = linkService.typeDef;

        // determine how to join this table, based on the definition
        const joinField =
          linkService.joinFieldMap[currentTypeDef.definition.name];

        if (!joinField)
          throw new Error(
            `Joining type '${linkJoinType}' from type '${currentTypeDef.definition.name}' is not configured`
          );

        // advance the currentTypeDef to the link Join Type Def
        currentTypeDef = linkJoinTypeDef;

        // set the actualFieldPart to the 2nd part
        actualFieldPart = subParts[1];

        const linkTableAlias = acquireTableAlias(tableIndexMap, linkJoinType);

        // set and advance the join table
        currentJoinObject[fieldPart] = {
          table: linkJoinType,
          alias: linkTableAlias,
          field: "id",
          joinField,
          nested: {},
        };

        currentJoinObject = currentJoinObject[fieldPart].nested;

        // set currentTableAlias
        currentTableAlias = linkTableAlias;
      }

      // find the field on the currentTypeDef
      const typeDefField = currentTypeDef.definition.fields[actualFieldPart];

      if (!typeDefField)
        throw new Error(
          `Field '${actualFieldPart}' does not exist on type '${currentTypeDef.definition.name}'`
        );

      if (!typeDefField.sqlOptions)
        throw new Error(
          `Field '${actualFieldPart}' on type '${currentTypeDef.definition.name}' is not a SQL field`
        );

      const actualSqlField = typeDefField.sqlOptions.field ?? actualFieldPart;

      // if no more fields, set the alias
      if (!fieldParts[index + 1]) {
        fieldInfoMap.set(field, {
          alias: currentTableAlias + "." + actualSqlField,
          tableAlias: currentTableAlias,
          fieldDef: typeDefField,
          finalField: actualSqlField,
        });
      } else {
        // if more fields, ensure joinInfo is set. need to join this field
        const joinType = typeDefField.sqlOptions.joinType;
        if (!joinType)
          throw new Error(
            `Field '${actualFieldPart}' is not joinable on type '${currentTypeDef.definition.name}'`
          );

        // ensure the type exists
        const nextTypeDef = objectTypeDefs.get(joinType);
        if (!nextTypeDef)
          throw new Error(`Join type '${joinType}' does not exist`);

        // check requiredJoins to see if is already joined
        let joinTableAlias;
        if (currentJoinObject[actualSqlField]) {
          joinTableAlias = currentJoinObject[actualSqlField].alias;
        } else {
          joinTableAlias = acquireTableAlias(tableIndexMap, joinType);

          // set current field as join field
          currentJoinObject[actualSqlField] = {
            table: joinType,
            alias: joinTableAlias,
            field: actualSqlField,
            joinField: "id",
            nested: {},
          };
        }

        // shift these variables
        currentJoinObject = currentJoinObject[actualSqlField].nested;
        currentTypeDef = nextTypeDef;
        currentTableAlias = joinTableAlias;
      }
    });
  });
  return {
    fieldInfoMap,
    requiredJoins,
    tableIndexMap,
  };
}

function applyWhere(
  knexObject: Knex.QueryBuilder,
  whereObject: SqlWhereObject,
  fieldInfoMap: Map<string, FieldInfo>
) {
  whereObject.fields.forEach((whereSubObject) => {
    if (isSqlWhereObject(whereSubObject)) {
      knexObject[whereObject.connective === "OR" ? "orWhere" : "andWhere"](
        (builder) => {
          applyWhere(builder, whereSubObject, fieldInfoMap);
        }
      );
    } else {
      const operator = whereSubObject.operator ?? "eq";
      const fieldInfo = fieldInfoMap.get(whereSubObject.field)!;
      const getter = fieldInfo.fieldDef.sqlOptions?.getter;
      const bindings: any[] = [];

      let whereSubstatement = getter
        ? getter(fieldInfo.tableAlias, fieldInfo.finalField)
        : `"${fieldInfo.tableAlias}".${fieldInfo.finalField}`;
      switch (operator) {
        case "eq":
          if (whereSubObject.value === null) {
            whereSubstatement += " IS NULL";
          } else {
            whereSubstatement += " = ?";
            bindings.push(whereSubObject.value);
          }
          break;
        case "neq":
          if (whereSubObject.value === null) {
            whereSubstatement += " IS NOT NULL";
          } else {
            whereSubstatement += " != ?";
            bindings.push(whereSubObject.value);
          }
          break;
        case "gt":
          if (whereSubObject.value === null) {
            throw new Error("Can't use this operator with null");
          } else {
            whereSubstatement += " > ?";
            bindings.push(whereSubObject.value);
          }
          break;
        case "gte":
          if (whereSubObject.value === null) {
            throw new Error("Can't use this operator with null");
          } else {
            whereSubstatement += " >= ?";
            bindings.push(whereSubObject.value);
          }
          break;
        case "lt":
          if (whereSubObject.value === null) {
            throw new Error("Can't use this operator with null");
          } else {
            whereSubstatement += " < ?";
            bindings.push(whereSubObject.value);
          }
          break;
        case "lte":
          if (whereSubObject.value === null) {
            throw new Error("Can't use this operator with null");
          } else {
            whereSubstatement += " <= ?";
            bindings.push(whereSubObject.value);
          }
          break;
        case "in":
          if (Array.isArray(whereSubObject.value)) {
            // if array is empty, is equivalent of FALSE
            if (whereSubObject.value.length < 1) {
              whereSubstatement = "FALSE";
            } else {
              whereSubstatement += ` IN (${whereSubObject.value.map(
                () => "?"
              )})`;
              whereSubObject.value.forEach((ele) => {
                bindings.push(ele);
              });
            }
          } else {
            throw new Error("Must provide array for in/nin operators");
          }
          break;
        case "nin":
          if (Array.isArray(whereSubObject.value)) {
            // if array is empty, is equivalent of TRUE
            if (whereSubObject.value.length < 1) {
              whereSubstatement = "TRUE";
            } else {
              whereSubstatement += ` NOT IN (${whereSubObject.value.map(
                () => "?"
              )})`;
              whereSubObject.value.forEach((ele) => {
                bindings.push(ele);
              });
            }
          } else {
            throw new Error("Must provide array for in/nin operators");
          }
          break;
        case "regex":
          if (whereSubObject.value instanceof RegExp) {
            // for regex, also need to cast the field as TEXT
            whereSubstatement = "CAST(" + whereSubstatement + " AS TEXT)";
            whereSubstatement += ` ~${
              whereSubObject.value.ignoreCase ? "*" : ""
            } ?`;
            bindings.push(
              whereSubObject.value.toString().replace(/(^\/)|(\/[^\/]*$)/g, "")
            );
          } else {
            throw new Error("Invalid Regex value");
          }
          break;
        case "like":
          if (whereSubObject.value === null) {
            throw new Error("Can't use this operator with null");
          } else {
            whereSubstatement += " LIKE ?";
            bindings.push(whereSubObject.value);
          }
          break;
        default:
          throw new Error("Invalid operator");
      }
      knexObject[
        whereObject.connective === "OR" ? "orWhereRaw" : "andWhereRaw"
      ](whereSubstatement, bindings);
    }
  });
}

function applyJoins(
  knexObject: Knex.QueryBuilder,
  currentJoinObject: { [x: string]: JoinObject },
  parentTableAlias: string
) {
  for (const field in currentJoinObject) {
    knexObject.leftJoin(
      { [currentJoinObject[field].alias]: currentJoinObject[field].table },
      parentTableAlias + "." + currentJoinObject[field].field,
      currentJoinObject[field].alias + "." + currentJoinObject[field].joinField
    );
    if (currentJoinObject[field].nested) {
      applyJoins(
        knexObject,
        currentJoinObject[field].nested,
        currentJoinObject[field].alias
      );
    }
  }
}

export async function fetchTableRows(
  sqlQuery: SqlSelectQuery,
  fieldPath?: string[]
) {
  try {
    const tableAlias = sqlQuery.from + "0";

    const relevantFields: Set<string> = new Set();

    // gather all of the "known fields" in select, where, groupBy,
    sqlQuery.select.forEach((ele) => relevantFields.add(ele.field));

    if (sqlQuery.groupBy)
      sqlQuery.groupBy.forEach((field) => relevantFields.add(field));

    if (sqlQuery.orderBy)
      sqlQuery.orderBy.forEach((ele) => relevantFields.add(ele.field));

    extractFields(sqlQuery.where).forEach((field) => relevantFields.add(field));

    const { fieldInfoMap, requiredJoins, tableIndexMap } = processFields(
      relevantFields,
      sqlQuery.from
    );

    const knexObject = knex.from({ [tableAlias]: sqlQuery.from });

    // apply the joins
    applyJoins(knexObject, requiredJoins, tableAlias);

    // go through fields, find ones with specialJoin
    fieldInfoMap.forEach((fieldInfo) => {
      const specialJoin = fieldInfo.fieldDef.sqlOptions?.specialJoin;
      if (specialJoin) {
        // if there is a specialJoin, get a suitable table alias
        const joinTableAlias = acquireTableAlias(
          tableIndexMap,
          specialJoin.foreignTable
        );
        specialJoin.joinFunction(
          knexObject,
          tableAlias,
          joinTableAlias,
          sqlQuery.specialParams
        );
        // correct the alias
        fieldInfo.alias = joinTableAlias + "." + fieldInfo.finalField;
        fieldInfo.tableAlias = joinTableAlias;
      }
    });

    // build and apply select object
    const knexSelectObject = {};

    sqlQuery.select.forEach((ele) => {
      const fieldInfo = fieldInfoMap.get(ele.field)!;
      // does it have a getter?
      const getter = fieldInfo.fieldDef.sqlOptions?.getter;

      knexSelectObject[ele.as ?? ele.field] = getter
        ? knex.raw(getter(fieldInfo.tableAlias, fieldInfo.finalField))
        : fieldInfo.alias;
    });

    knexObject.select(knexSelectObject);

    // apply groupBy
    if (sqlQuery.groupBy) {
      sqlQuery.groupBy.forEach((field) => {
        const mappedField = fieldInfoMap.get(field);
        // should always exist
        mappedField && knexObject.groupBy(mappedField.alias);
      });
    }

    // apply orderBy
    if (sqlQuery.orderBy) {
      knexObject.orderByRaw(
        sqlQuery.orderBy
          .map((ele) => {
            const fieldInfo = fieldInfoMap.get(ele.field)!;
            return `"${fieldInfo.tableAlias}".${fieldInfo.finalField} ${
              ele.desc ? "desc NULLS LAST" : "asc NULLS FIRST"
            }`;
          })
          .join(", ")
      );
    }

    // apply where
    if (sqlQuery.where.fields.length > 0) {
      applyWhere(knexObject, sqlQuery.where, fieldInfoMap);
    }

    // apply limit
    if (sqlQuery.limit) {
      knexObject.limit(sqlQuery.limit);
    }

    // apply distinct
    if (sqlQuery.distinct) {
      knexObject.distinctOn(
        sqlQuery.orderBy
          ? sqlQuery.orderBy.map((ele) => fieldInfoMap.get(ele.field)!.alias)
          : []
      );
    }

    return await knexObject;
  } catch (err) {
    throw generateError(err, fieldPath);
  }
}

export async function countTableRows(
  sqlQuery: SqlCountQuery,
  fieldPath?: string[]
) {
  try {
    const tableAlias = sqlQuery.from + "0";

    const relevantFields: Set<string> = new Set();

    extractFields(sqlQuery.where).forEach((field) => relevantFields.add(field));

    const { fieldInfoMap, requiredJoins, tableIndexMap } = processFields(
      relevantFields,
      sqlQuery.from
    );

    const knexObject = knex.from({ [tableAlias]: sqlQuery.from });

    // apply the joins
    applyJoins(knexObject, requiredJoins, tableAlias);

    // go through fields, find ones with specialJoin
    fieldInfoMap.forEach((fieldInfo) => {
      const specialJoin = fieldInfo.fieldDef.sqlOptions?.specialJoin;
      if (specialJoin) {
        // if there is a specialJoin, get a suitable table alias
        const joinTableAlias = acquireTableAlias(
          tableIndexMap,
          specialJoin.foreignTable
        );
        specialJoin.joinFunction(
          knexObject,
          tableAlias,
          joinTableAlias,
          sqlQuery.specialParams
        );
        // correct the alias
        fieldInfo.alias = joinTableAlias + "." + fieldInfo.finalField;
      }
    });

    // apply where
    if (sqlQuery.where.fields.length > 0) {
      applyWhere(knexObject, sqlQuery.where, fieldInfoMap);
    }

    // apply limit
    if (sqlQuery.limit) {
      knexObject.limit(sqlQuery.limit);
    }

    // apply distinct
    knexObject[sqlQuery.distinct ? "countDistinct" : "count"](
      knex.raw(`"${tableAlias}".id`)
    );

    const results = await knexObject;
    return Number(results[0].count);
  } catch (err) {
    throw generateError(err, fieldPath);
  }
}

export async function insertTableRow(
  sqlQuery: SqlInsertQuery,
  fieldPath?: string[]
) {
  try {
    // check if there is a sql setter on the field
    const currentTypeDef = objectTypeDefs.get(sqlQuery.table);
    if (!currentTypeDef) {
      throw new Error(`TypeDef for '${sqlQuery.table}' not found`);
    }

    // handle set fields and convert to actual sql fields, if aliased
    const sqlFields = {};
    for (const fieldname in sqlQuery.fields) {
      const sqlOptions = currentTypeDef.definition.fields[fieldname].sqlOptions;
      if (!sqlOptions) throw new Error(`'${fieldname}' is not a sql field`);

      sqlFields[sqlOptions.field ?? fieldname] = sqlOptions.parseValue
        ? sqlOptions.parseValue(sqlQuery.fields[fieldname])
        : sqlQuery.fields[fieldname];
    }

    const knexObject = knex(sqlQuery.table).insert(sqlFields).returning(["id"]);

    sqlQuery.extendFn && sqlQuery.extendFn(knexObject);

    return await knexObject;
  } catch (err) {
    throw generateError(err, fieldPath);
  }
}

export async function updateTableRow(
  sqlQuery: SqlUpdateQuery,
  fieldPath?: string[]
) {
  try {
    const tableAlias = sqlQuery.table + "0";

    const relevantFields: Set<string> = new Set();

    extractFields(sqlQuery.where).forEach((field) => relevantFields.add(field));

    const { fieldInfoMap, requiredJoins, tableIndexMap } = processFields(
      relevantFields,
      sqlQuery.table
    );

    // check if there is a sql setter on the field
    const currentTypeDef = objectTypeDefs.get(sqlQuery.table);
    if (!currentTypeDef) {
      throw new Error(`TypeDef for '${sqlQuery.table}' not found`);
    }

    // handle set fields and convert to actual sql fields, if aliased
    const sqlFields = {};
    for (const fieldname in sqlQuery.fields) {
      const sqlOptions = currentTypeDef.definition.fields[fieldname].sqlOptions;
      if (!sqlOptions) throw new Error(`'${fieldname}' is not a sql field`);

      sqlFields[sqlOptions.field ?? fieldname] = sqlOptions.parseValue
        ? sqlOptions.parseValue(sqlQuery.fields[fieldname])
        : sqlQuery.fields[fieldname];
    }

    const knexObject = knex.from({ [tableAlias]: sqlQuery.table });

    // apply the joins
    applyJoins(knexObject, requiredJoins, tableAlias);

    // apply where
    if (sqlQuery.where.fields.length > 0) {
      applyWhere(knexObject, sqlQuery.where, fieldInfoMap);
    }

    sqlQuery.extendFn && sqlQuery.extendFn(knexObject);

    return await knexObject.update(sqlFields);
  } catch (err) {
    throw generateError(err, fieldPath);
  }
}

export async function deleteTableRow(
  sqlQuery: SqlDeleteQuery,
  fieldPath?: string[]
) {
  try {
    const tableAlias = sqlQuery.table + "0";

    const relevantFields: Set<string> = new Set();

    extractFields(sqlQuery.where).forEach((field) => relevantFields.add(field));

    const { fieldInfoMap, requiredJoins, tableIndexMap } = processFields(
      relevantFields,
      sqlQuery.table
    );

    const knexObject = knex.from({ [tableAlias]: sqlQuery.table });

    // apply the joins
    applyJoins(knexObject, requiredJoins, tableAlias);

    // apply where
    if (sqlQuery.where.fields.length > 0) {
      applyWhere(knexObject, sqlQuery.where, fieldInfoMap);
    }

    sqlQuery.extendFn && sqlQuery.extendFn(knexObject);

    return await knexObject.delete();
  } catch (err) {
    throw generateError(err, fieldPath);
  }
}

export { executeDBQuery };
