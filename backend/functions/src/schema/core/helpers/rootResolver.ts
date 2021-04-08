import {
  GiraffeqlObjectTypeLookup,
  GiraffeqlArgsError,
  RootResolverDefinition,
  GiraffeqlInitializationError,
  GiraffeqlRootResolverType,
  GiraffeqlInputType,
  GiraffeqlInputTypeLookup,
  GiraffeqlObjectType,
  GiraffeqlInputFieldType,
} from "giraffeql";
import { NormalService, PaginatedService, EnumService } from "../services";
import { generatePaginatorPivotResolverObject } from "../helpers/typeDef";
import { capitalizeString, isObject } from "../helpers/shared";
type BaseRootResolverTypes =
  | "get"
  | "getMultiple"
  | "delete"
  | "create"
  | "update"
  | "created"
  | "deleted"
  | "updated"
  | "listUpdated";

export function generateBaseRootResolvers(
  service: NormalService,
  methods: BaseRootResolverTypes[]
): { [x: string]: GiraffeqlRootResolverType } {
  const capitalizedClass = capitalizeString(service.typename);

  const rootResolvers = {};

  methods.forEach((method) => {
    const capitalizedMethod = capitalizeString(method);
    let methodName;
    switch (method) {
      case "get":
        methodName = method + capitalizedClass;
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "get",
            route: "/" + service.typename + "/:id",
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          args: new GiraffeqlInputFieldType({
            required: true,
            type: service.inputTypeDefLookup,
          }),
          resolver: ({ req, query, args, fieldPath }) => {
            return service.getRecord({
              req,
              query,
              args,
              fieldPath,
            });
          },
        });
        break;
      case "getMultiple":
        if (service instanceof PaginatedService) {
          methodName = "get" + capitalizeString(service.paginator.typename);
          rootResolvers[
            "get" + capitalizeString(service.paginator.typename)
          ] = new GiraffeqlRootResolverType(<RootResolverDefinition>{
            name: methodName,
            restOptions: {
              method: "get",
              route: "/" + service.typename,
              query: service.paginator.presets.default,
            },
            ...generatePaginatorPivotResolverObject({
              pivotService: service,
            }),
          });
        } else {
          throw new GiraffeqlInitializationError({
            message: `Cannot getMultiple of a non-paginated type '${service.typename}'`,
          });
        }
        break;
      case "delete":
        methodName = method + capitalizedClass;
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "delete",
            route: "/" + service.typename + "/:id",
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          args: new GiraffeqlInputFieldType({
            required: true,
            type: service.inputTypeDefLookup,
          }),
          resolver: ({ req, query, args, fieldPath }) =>
            service.deleteRecord({
              req,
              query,
              args,
              fieldPath,
            }),
        });
        break;
      case "update":
        const updateArgs = {};
        methodName = method + capitalizedClass;
        Object.entries(service.getTypeDef().definition.fields).forEach(
          ([key, typeDefField]) => {
            let typeField = typeDefField.type;

            // if typeField is GiraffeqlObjectTypeLookup, convert to GiraffeqlInputTypeLookup
            if (typeField instanceof GiraffeqlObjectTypeLookup) {
              typeField = new GiraffeqlInputTypeLookup(typeField.name);
            } else if (typeField instanceof GiraffeqlObjectType) {
              typeField = new GiraffeqlInputTypeLookup(
                typeField.definition.name
              );
            }

            if (typeDefField.updateable) {
              // generate the argDefinition for the string type
              updateArgs[key] = new GiraffeqlInputFieldType({
                type: typeField,
                required: false,
                allowNull: typeDefField.allowNull,
                arrayOptions: typeDefField.arrayOptions,
              });
            }
          }
        );
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "put",
            route: "/" + service.typename + "/:id",
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          args: new GiraffeqlInputFieldType({
            required: true,
            type: new GiraffeqlInputType({
              name: methodName,
              fields: {
                item: new GiraffeqlInputFieldType({
                  type: service.inputTypeDefLookup,
                  required: true,
                }),
                fields: new GiraffeqlInputFieldType({
                  type: new GiraffeqlInputType({
                    name: "update" + capitalizedClass + "Fields",
                    fields: updateArgs,
                    inputsValidator: (args, fieldPath) => {
                      // check if at least 1 valid update field provided
                      if (!isObject(args)) {
                        throw new GiraffeqlArgsError({
                          message: `Object args required`,
                          fieldPath,
                        });
                      }

                      const { id, ...updateFields } = args;
                      if (Object.keys(updateFields).length < 1)
                        throw new GiraffeqlArgsError({
                          message: `No valid fields to update`,
                          fieldPath,
                        });
                    },
                  }),
                  required: true,
                }),
              },
            }),
          }),
          resolver: ({ req, query, args, fieldPath }) =>
            service.updateRecord({ req, query, args, fieldPath }),
        });
        break;
      case "create":
        const createArgs = {};
        methodName = method + capitalizedClass;
        Object.entries(service.getTypeDef().definition.fields).forEach(
          ([key, typeDefField]) => {
            let typeField = typeDefField.type;

            // if typeField is GiraffeqlObjectTypeLookup, convert to GiraffeqlInputTypeLookup
            if (typeField instanceof GiraffeqlObjectTypeLookup) {
              typeField = new GiraffeqlInputTypeLookup(typeField.name);
            } else if (typeField instanceof GiraffeqlObjectType) {
              typeField = new GiraffeqlInputTypeLookup(
                typeField.definition.name
              );
            }

            if (typeDefField.addable) {
              // generate the argDefinition for the string type
              createArgs[key] = new GiraffeqlInputFieldType({
                type: typeField,
                required: typeDefField.required,
                allowNull: typeDefField.allowNull,
                arrayOptions: typeDefField.arrayOptions,
              });
            }
          }
        );
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "post",
            route: "/" + service.typename,
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          args: new GiraffeqlInputFieldType({
            required: true,
            type: new GiraffeqlInputType({
              name: methodName,
              fields: createArgs,
            }),
          }),
          resolver: ({ req, query, args, fieldPath }) =>
            service.createRecord({
              req,
              query,
              args,
              fieldPath,
            }),
        });
        break;
      case "created":
        methodName = service.typename + capitalizedMethod;
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "post",
            route: "/subscribe/" + service.typename + capitalizedMethod,
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          resolver: ({ req, query, args, fieldPath }) =>
            service.subscribeToMultipleItem(
              service.typename + capitalizedMethod,
              {
                req,
                query,
                args,
                fieldPath,
              }
            ),
        });
        break;
      case "deleted":
        methodName = service.typename + capitalizedMethod;
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "post",
            route: "/subscribe/" + service.typename + capitalizedMethod,
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          resolver: ({ req, query, args, fieldPath }) =>
            service.subscribeToSingleItem(
              service.typename + capitalizedMethod,
              {
                req,
                query,
                args,
                fieldPath,
              }
            ),
        });
        break;
      case "updated":
        methodName = service.typename + capitalizedMethod;
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "post",
            route: "/subscribe/" + service.typename + capitalizedMethod,
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          resolver: ({ req, query, args, fieldPath }) =>
            service.subscribeToSingleItem(
              service.typename + capitalizedMethod,
              {
                req,
                query,
                args,
                fieldPath,
              }
            ),
        });
        break;
      case "listUpdated":
        methodName = service.typename + capitalizedMethod;
        rootResolvers[methodName] = new GiraffeqlRootResolverType({
          name: methodName,
          restOptions: {
            method: "post",
            route: "/subscribe/" + service.typename + capitalizedMethod,
            query: service.presets.default,
          },
          type: service.typeDefLookup,
          allowNull: false,
          resolver: ({ req, query, args, fieldPath }) =>
            service.subscribeToMultipleItem(
              service.typename + capitalizedMethod,
              {
                req,
                query,
                args,
                fieldPath,
              }
            ),
        });
        break;
      default:
        throw new Error(`Unknown root resolver method requested: '${method}'`);
    }
  });

  return rootResolvers;
}

export function generateEnumRootResolver(
  enumService: EnumService
): { [x: string]: GiraffeqlRootResolverType } {
  const capitalizedClass = capitalizeString(enumService.paginator.typename);
  const methodName = "get" + capitalizedClass;
  const rootResolvers = {
    [methodName]: new GiraffeqlRootResolverType({
      name: methodName,
      restOptions: {
        method: "get",
        route: "/" + enumService.paginator.typename,
        query: enumService.presets.default,
      },
      allowNull: false,
      type: enumService.paginator.typeDef,
      resolver: ({ req, args, query, fieldPath }) =>
        enumService.paginator.getRecord({
          req,
          args,
          query,
          fieldPath,
        }),
    }),
  };

  return rootResolvers;
}
