import type { Request } from "express";
import { ObjectTypeDefinitionField } from "giraffeql";
import Knex = require("knex");
import { userPermissionEnum, userRoleKenum } from "../schema/enums";

export type StringKeyObject = Record<string, unknown>;

export type PusherEnv = {
  readonly app_id: string;
  readonly key: string;
  readonly secret: string;
  readonly cluster: string;
};

export type SpecialJoinFunction = (
  knexObject: Knex.QueryBuilder,
  parentTableAlias: string,
  joinTableAlias: string,
  specialParams: any
) => void;

export type ObjectTypeDefSqlOptions = {
  // if this is a join field, the typename of the joinType
  joinType?: string;

  // if this is an alias, the actual final field on the sqlTable this field refers to
  field?: string;

  specialJoin?: {
    // if the field exists on a foreign table, specify it here.
    foreignTable: string;
    // the function that will perform the necessary joins to access the foreignTable
    joinFunction: SpecialJoinFunction;
  };

  getter?: (tableAlias: string, field: string) => string;
  setter?: (value: string) => string;
  parseValue?: (value: unknown) => unknown; // performed before inserts/updates

  // sql definition
  type?: SqlType;
  defaultValue?: any;
  unique?: boolean | string;
};

export type SqlType =
  | "string"
  | "integer"
  | "dateTime"
  | "date"
  | "text"
  | "float"
  | "decimal"
  | "boolean"
  | "json";

export type ExternalQuery = {
  [x: string]: any;
};

export type ServiceFunctionInputs = {
  req: Request;
  fieldPath: string[];
  args: any;
  query?: unknown;
  data?: any;
  isAdmin?: boolean;
};

export type ContextUser = {
  id: number;
  role: userRoleKenum | null;
  permissions: userPermissionEnum[];
};

export type AccessControlMap = {
  [x: string]: AccessControlFunction;
};

export type AccessControlFunction = (
  inputs: ServiceFunctionInputs
) => boolean | Promise<boolean>;

export type DataloaderFunctionInput = {
  req: Request;
  fieldPath: string[];
  args: unknown;
  query: unknown;
  currentObject: unknown;
  data: any;
};

export type DataloaderFunction = (
  input: DataloaderFunctionInput
) => Promise<unknown[]>;

export type PaginatorData = {
  rootArgs: StringKeyObject;
  records: StringKeyObject[];
};

export type CustomResolverFunction = (
  typename: string,
  req: Request,
  value: any,
  currentObject: any
) => any;
