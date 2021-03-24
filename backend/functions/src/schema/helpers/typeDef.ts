import {
  ObjectTypeDefinitionField,
  ScalarDefinition,
  InputTypeDefinition,
  ResolverFunction,
  RootResolverFunction,
  JomqlArgsError,
  objectTypeDefs,
  JomqlInitializationError,
  JomqlInputType,
  JomqlScalarType,
  JomqlObjectTypeLookup,
  JomqlObjectType,
  JomqlInputFieldType,
  ArrayOptions,
  inputTypeDefs,
  ObjectTypeDefinition,
} from "jomql";
import { knex } from "../../utils/knex";
import * as Resolver from "./resolver";
import { deepAssign, isObject, snakeToCamel } from "./shared";
import { BaseService, NormalService, PaginatedService } from "../core/services";
import { linkDefs } from "../links";
import * as Scalars from "../scalars";
import type { ObjectTypeDefSqlOptions, SqlType } from "../../types";
import { FieldObject } from "../core/services/normal";

type GenerateFieldParams = {
  name?: string;
  description?: string;
  allowNull: boolean;
  hidden?: boolean;
  nestHidden?: boolean;
  defaultValue?: unknown;
  sqlOptions?: Partial<ObjectTypeDefSqlOptions>;
  typeDefOptions?: Partial<ObjectTypeDefinitionField>;
};

/*
 ** Standard Fields
 */

// generic field builder
export function generateStandardField(
  params: {
    sqlType?: SqlType;
    type: JomqlScalarType | JomqlObjectTypeLookup | JomqlObjectType;
    arrayOptions?: ArrayOptions;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull,
    arrayOptions,
    hidden = false,
    nestHidden = false,
    defaultValue,
    sqlType,
    type,
    sqlOptions,
    typeDefOptions,
  } = params;

  const typeDef = <ObjectTypeDefinitionField>{
    type,
    description,
    arrayOptions,
    allowNull,
    required: defaultValue === undefined && !allowNull,
    sqlOptions: sqlType
      ? {
          type: sqlType,
          ...(defaultValue !== undefined && { defaultValue: defaultValue }),
          ...sqlOptions,
        }
      : undefined,
    hidden,
    nestHidden,
    addable: true, // default addable and updateable
    updateable: true,
    ...typeDefOptions,
  };
  return typeDef;
}

// NOT a sql field.
export function generateGenericScalarField(
  params: {
    type: JomqlScalarType;
    arrayOptions?: ArrayOptions;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    arrayOptions,
    defaultValue,
    hidden,
    nestHidden,
    type,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    arrayOptions,
    defaultValue,
    hidden,
    nestHidden,
    type: type ?? Scalars.string,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateStringField(
  params: {
    type?: JomqlScalarType;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    type,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "string",
    type: type ?? Scalars.string,
    sqlOptions,
    typeDefOptions,
  });
}

// DateTime as UNIX timestamp
export function generateUnixTimestampField(
  params: {
    nowOnly?: boolean; // if the unix timestamp can only be set to now()
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
    nowOnly,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "dateTime",
    type: Scalars.unixTimestamp,
    sqlOptions: {
      getter: (tableAlias, field) =>
        `extract(epoch from "${tableAlias}".${field})`,
      parseValue: nowOnly
        ? () => knex.fn.now()
        : (value: unknown) => {
            if (typeof value !== "number") throw 1; // should never happen
            // assuming the timestamp is being sent in seconds
            return new Date(value * 1000);
          },
      ...sqlOptions,
    },
    typeDefOptions,
  });
}

export function generateDateField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "date",
    type: Scalars.date,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateTextField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull: allowNull,
    hidden,
    nestHidden,
    sqlType: "text",
    type: Scalars.string,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateIntegerField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "integer",
    type: Scalars.number,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateFloatField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "float",
    type: Scalars.number,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateDecimalField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "decimal",
    type: Scalars.number,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateBooleanField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    nestHidden,
    sqlType: "boolean",
    type: Scalars.boolean,
    sqlOptions,
    typeDefOptions,
  });
}

// array of [type], stored in DB as JSON
export function generateArrayField(
  params: {
    type: JomqlScalarType | JomqlObjectTypeLookup | JomqlObjectType;
    allowNullElement?: boolean;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    allowNullElement = false,
    hidden,
    nestHidden,
    type,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    arrayOptions: {
      allowNullElement,
    },
    allowNull,
    hidden,
    nestHidden,
    sqlType: "json",
    type,
    sqlOptions: {
      // necessary for inserting JSON into DB properly
      parseValue: (val) => JSON.stringify(val),
      ...sqlOptions,
    },
    typeDefOptions: {
      ...typeDefOptions,
    },
  });
}

// generic JSON field, stored as JSON, but input/output as stringified JSON
export function generateJSONField(params: GenerateFieldParams) {
  const {
    description,
    allowNull = true,
    hidden,
    nestHidden,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    hidden,
    nestHidden,
    sqlType: "json",
    type: Scalars.jsonString,
    sqlOptions: {
      // necessary for inserting JSON into DB properly -- already stringified
      // parseValue: (val) => JSON.stringify(val),
      ...sqlOptions,
    },
    typeDefOptions: {
      ...typeDefOptions,
    },
  });
}

// should handle kenums too
export function generateEnumField(
  params: {
    scalarDefinition: JomqlScalarType;
    isKenum?: boolean;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    nestHidden,
    scalarDefinition,
    sqlOptions,
    typeDefOptions,
    isKenum = false,
  } = params;

  // if scalarDefinition.parseValue, run that on defaultValue

  return generateStandardField({
    description,
    allowNull: allowNull,
    defaultValue:
      scalarDefinition.definition.parseValue && defaultValue !== undefined
        ? scalarDefinition.definition.parseValue(defaultValue)
        : defaultValue,
    hidden,
    nestHidden,
    sqlType: isKenum ? "integer" : "string",
    type: scalarDefinition,
    sqlOptions,
    typeDefOptions,
  });
}

export function generateKeyValueArray(
  params: {
    valueType?: JomqlScalarType;
    allowNullValue?: boolean;
    allowNull?: boolean;
  } = {}
) {
  const {
    valueType = Scalars.string,
    allowNullValue = false,
    allowNull = true,
  } = params;
  // generate the input type if not exists
  if (!inputTypeDefs.has("keyValueObject")) {
    new JomqlInputType({
      name: "keyValueObject",
      description: "Object Input with key and value properties",
      fields: {
        key: new JomqlInputFieldType({
          type: Scalars.string,
          required: true,
        }),
        value: new JomqlInputFieldType({
          type: valueType,
          required: !allowNullValue,
        }),
      },
    });
  }

  // generate the object type if not exists
  if (!objectTypeDefs.has("keyValueObject")) {
    new JomqlObjectType({
      name: "keyValueObject",
      description: "Object with key and value properties",
      fields: {
        key: {
          type: Scalars.string,
          allowNull: false,
        },
        value: {
          type: valueType,
          allowNull: allowNullValue,
        },
      },
    });
  }

  return generateArrayField({
    allowNull,
    allowNullElement: false,
    type: new JomqlObjectTypeLookup("keyValueObject"),
  });
}

/*
 ** Field Helpers (Commonly used fields)
 */

export function generateCreatedAtField() {
  return {
    createdAt: generateUnixTimestampField({
      description: "When the record was created",
      allowNull: false,
      defaultValue: knex.fn.now(),
      sqlOptions: { field: "created_at" },
      typeDefOptions: { addable: false, updateable: false }, // not addable or updateable
    }),
  };
}

export function generateUpdatedAtField() {
  return {
    updatedAt: generateUnixTimestampField({
      description: "When the record was last updated",
      allowNull: true,
      sqlOptions: { field: "updated_at" },
      typeDefOptions: { addable: false, updateable: false }, // not addable or updateable
      nowOnly: true,
    }),
  };
}

export function generateIdField() {
  return {
    id: generateStandardField({
      description: "The unique ID of the field",
      allowNull: false,
      sqlType: "integer",
      type: Scalars.id,
      typeDefOptions: { addable: false, updateable: false }, // not addable or updateable
    }),
  };
}

export function generateTypenameField(service: BaseService) {
  return {
    __typename: generateGenericScalarField({
      description: "The typename of the record",
      allowNull: false,
      type: Scalars.string,
      typeDefOptions: {
        resolver: () => service.typename,
        args: new JomqlInputFieldType({
          required: false,
          allowNull: false,
          type: Scalars.number,
        }),
        addable: false,
        updateable: false, // not addable or updateable
      },
    }),
  };
}

export function generateCreatedByField(service: NormalService) {
  return {
    createdBy: generateJoinableField({
      allowNull: false,
      service,
      sqlOptions: {
        field: "created_by",
      },
      typeDefOptions: { addable: false, updateable: false }, // not addable or updateable
    }),
  };
}

export function generateJoinableField(
  params: {
    service: NormalService;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    sqlOptions,
    typeDefOptions,
    service,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    sqlType: "integer",
    type: service.typeDefLookup,
    typeDefOptions,
    sqlOptions: {
      joinType: service.typename,
      ...sqlOptions,
    },
  });
}

// alternative strategy for "joins"
export function generateDataloadableField(
  params: {
    service: NormalService;
  } & GenerateFieldParams
) {
  const {
    description,
    allowNull = true,
    defaultValue,
    hidden,
    service,
    sqlOptions,
    typeDefOptions,
  } = params;
  return generateStandardField({
    description,
    allowNull,
    defaultValue,
    hidden,
    sqlType: "integer",
    type: service.typeDefLookup,
    sqlOptions,
    typeDefOptions: {
      defer: true,
      dataloader: ({ req, args, query, currentObject, fieldPath, data }) => {
        // if data.idArray empty, return empty array
        if (!data.idArray.length) return Promise.resolve([]);
        // aggregator function that must accept data.idArray = [1, 2, 3, ...]
        return Resolver.getObjectType({
          typename: service.typename,
          req,
          fieldPath,
          externalQuery: query,
          sqlParams: {
            where: {
              fields: [{ field: "id", operator: "in", value: data.idArray }],
            },
          },
          data,
        });
      },
      ...typeDefOptions,
    },
  });
}

function validateFieldPath(initialTypeDef: JomqlObjectType, fieldPath: string) {
  let currentTypeDef = initialTypeDef;
  let allowNull = false;
  const keyParts = fieldPath.split(/\./);
  let currentType;
  let currentObjectTypeField;

  keyParts.forEach((keyPart, keyIndex) => {
    if (!currentTypeDef.definition.fields[keyPart])
      throw new JomqlInitializationError({
        message: `Invalid fieldPath '${fieldPath}' on '${initialTypeDef.definition.name}'`,
      });

    currentObjectTypeField = currentTypeDef.definition.fields[keyPart];
    currentType = currentObjectTypeField.type;

    // if one in the chain has allowNull === true, then allowNull
    if (currentObjectTypeField.allowNull) allowNull = true;

    if (keyParts[keyIndex + 1]) {
      if (currentType instanceof JomqlObjectTypeLookup) {
        const lookupTypeDef = objectTypeDefs.get(currentType.name);

        if (!lookupTypeDef) {
          throw new JomqlInitializationError({
            message: `Invalid typeDef lookup for '${currentType.name}'`,
          });
        }

        currentTypeDef = lookupTypeDef;
      } else if (currentType instanceof JomqlObjectType) {
        currentTypeDef = currentType;
      } else {
        // must be scalar. should be over in the next iteration, else will fail
      }
    }
  });

  // final value must be scalar at the moment
  if (!(currentType instanceof JomqlScalarType)) {
    throw new JomqlInitializationError({
      message: `Final filter field must be a scalar type. Field: '${fieldPath}' on '${initialTypeDef.definition.name}'`,
    });
  }

  return {
    currentType,
    allowNull,
  };
}

// should work for *most* cases
// returns resolver object instead of a typeDef because it is also used to generate the rootResolver
export function generatePaginatorPivotResolverObject(params: {
  pivotService: PaginatedService;
  currentService?: NormalService;
}) {
  const { pivotService, currentService } = params;

  const filterByField = currentService
    ? currentService.typename.toLowerCase() + ".id"
    : null;

  // if filterByField, ensure that filterByField is a valid filterField on pivotService
  if (filterByField && !pivotService.filterFieldsMap[filterByField]) {
    throw new JomqlInitializationError({
      message: `Filter Key '${filterByField}' does not exist on type '${pivotService.typename}'`,
    });
  }

  // generate sortByKey ScalarDefinition
  const sortByScalarDefinition: ScalarDefinition = {
    name: pivotService.typename + "SortByKey",
    types: Object.entries(pivotService.sortFieldsMap).map(([key, value]) => {
      // ensure the path exists
      validateFieldPath(pivotService.getTypeDef(), value.field ?? key);

      return `"${key}"`;
    }),
    parseValue: (value) => {
      if (typeof value !== "string" || !(value in pivotService.sortFieldsMap))
        throw true;
      return value;
    },
  };

  const groupByScalarDefinition: ScalarDefinition = {
    name: pivotService.typename + "GroupByKey",
    types: Object.entries(pivotService.groupByFieldsMap).map(([key, value]) => {
      // ensure the path exists
      validateFieldPath(pivotService.getTypeDef(), value.field ?? key);
      return `"${key}"`;
    }),
    parseValue: (value) => {
      if (
        typeof value !== "string" ||
        !(value in pivotService.groupByFieldsMap)
      )
        throw true;
      return value;
    },
  };

  const filterByTypeDefinition: InputTypeDefinition = {
    name: pivotService.typename + "FilterByObject",
    fields: {},
  };

  // populate the fields nextTick, to allow objectTypeDefs to load
  process.nextTick(() => {
    Object.entries(pivotService.filterFieldsMap).reduce(
      (total, [filterKey, filterValue]) => {
        const { currentType, allowNull } = validateFieldPath(
          pivotService.getTypeDef(),
          filterValue.field ?? filterKey
        );

        total[filterKey] = new JomqlInputFieldType({
          type: new JomqlInputType(
            {
              name: `${pivotService.typename}FilterByField/${filterKey}`,
              fields: {
                eq: new JomqlInputFieldType({
                  type: currentType,
                  required: false,
                  allowNull,
                }),
                neq: new JomqlInputFieldType({
                  type: currentType,
                  required: false,
                  allowNull,
                }),
                gt: new JomqlInputFieldType({
                  type: currentType,
                  required: false,
                  allowNull: false,
                }),
                lt: new JomqlInputFieldType({
                  type: currentType,
                  required: false,
                  allowNull: false,
                }),
                in: new JomqlInputFieldType({
                  type: currentType,
                  arrayOptions: {
                    allowNullElement: allowNull,
                  },
                  required: false,
                }),
                nin: new JomqlInputFieldType({
                  type: currentType,
                  arrayOptions: {
                    allowNullElement: allowNull,
                  },
                  required: false,
                }),
                regex: new JomqlInputFieldType({
                  type: Scalars.regex,
                  required: false,
                }),
              },
            },
            true
          ),
          required: false,
          allowNull: false,
        });
        return total;
      },
      filterByTypeDefinition.fields
    );
  });

  let rootResolverFunction: RootResolverFunction | undefined;
  let resolverFunction: ResolverFunction | undefined;

  if (filterByField) {
    resolverFunction = async ({
      req,
      args,
      fieldPath,
      query,
      parentValue,
      data,
    }) => {
      // args should be validated already
      const validatedArgs = <any>args;

      // parentValue.id should be requested (via requiredSqlFields)
      const parentItemId = parentValue.id;

      // apply the filterByField as an arg to each filterObject
      const filterObjectArray = validatedArgs.filterBy ?? [{}];
      filterObjectArray.forEach((filterObject) => {
        filterObject[filterByField] = { eq: parentItemId };
      });

      return pivotService.paginator.getRecord({
        req,
        fieldPath,
        args: {
          ...validatedArgs,
          filterBy: filterObjectArray,
        },
        query,
        data,
      });
    };
  } else {
    rootResolverFunction = (inputs) => pivotService.paginator.getRecord(inputs);
  }

  const hasSearchFields =
    pivotService.searchFieldsMap &&
    Object.keys(pivotService.searchFieldsMap).length > 0;

  return <ObjectTypeDefinitionField>{
    type: new JomqlObjectTypeLookup(pivotService.paginator.typename),
    allowNull: false,
    args: new JomqlInputFieldType({
      required: true,
      type: new JomqlInputType(
        {
          name: pivotService.paginator.typename,
          fields: {
            first: new JomqlInputFieldType({
              type: Scalars.number,
            }),
            last: new JomqlInputFieldType({
              type: Scalars.number,
            }),
            after: new JomqlInputFieldType({
              type: Scalars.string,
            }),
            before: new JomqlInputFieldType({
              type: Scalars.string,
            }),
            sortBy: new JomqlInputFieldType({
              type: new JomqlScalarType(sortByScalarDefinition, true),
              arrayOptions: {
                allowNullElement: false,
              },
            }),
            sortDesc: new JomqlInputFieldType({
              type: Scalars.boolean,
              arrayOptions: {
                allowNullElement: false,
              },
            }),
            filterBy: new JomqlInputFieldType({
              arrayOptions: {
                allowNullElement: false,
              },
              type: new JomqlInputType(filterByTypeDefinition, true),
            }),
            groupBy: new JomqlInputFieldType({
              type: new JomqlScalarType(groupByScalarDefinition, true),
              arrayOptions: {
                allowNullElement: false,
              },
            }),
            ...(hasSearchFields && {
              search: new JomqlInputFieldType({
                type: Scalars.string,
              }),
            }),
          },
          inputsValidator: (args, fieldPath) => {
            // check for invalid first/last, before/after combos

            // after
            if (!isObject(args)) {
              throw new JomqlArgsError({
                message: `Args required`,
                fieldPath,
              });
            }

            if ("after" in args) {
              if (!("first" in args))
                throw new JomqlArgsError({
                  message: `Cannot use after without first`,
                  fieldPath,
                });
              if ("last" in args || "before" in args)
                throw new JomqlArgsError({
                  message: `Cannot use after with last/before`,
                  fieldPath,
                });
            }

            // first
            if ("first" in args) {
              if ("last" in args || "before" in args)
                throw new JomqlArgsError({
                  message: `Cannot use after with last/before`,
                  fieldPath,
                });
            }

            // before
            if ("before" in args) {
              if (!("last" in args))
                throw new JomqlArgsError({
                  message: `Cannot use before without last`,
                  fieldPath,
                });
            }

            // last
            if ("last" in args) {
              if (!("before" in args))
                throw new JomqlArgsError({
                  message: `Cannot use before without last`,
                  fieldPath,
                });
            }

            if (!("first" in args) && !("last" in args))
              throw new JomqlArgsError({
                message: `One of first or last required`,
                fieldPath,
              });
          },
        },
        true
      ),
    }),
    ...(rootResolverFunction
      ? {
          resolver: rootResolverFunction,
        }
      : {
          resolver: resolverFunction,
          requiredSqlFields: ["id"],
        }),
  };
}
