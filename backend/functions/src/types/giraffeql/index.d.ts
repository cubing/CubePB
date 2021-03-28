import type {
  ObjectTypeDefSqlOptions,
  DataloaderFunction,
  CustomResolverFunction,
} from "..";

declare global {
  namespace Giraffeql {
    interface ObjectTypeDefinitionField {
      sqlOptions?: ObjectTypeDefSqlOptions;
      addable?: boolean;
      updateable?: boolean;
      dataloader?: DataloaderFunction;
      deleter?: CustomResolverFunction;
      setter?: CustomResolverFunction;
      updater?: CustomResolverFunction;
      // sql field dependencies that need to be resolved in order to process the resolver
      requiredSqlFields?: string[];
      nestHidden?: boolean;
    }
  }
}
