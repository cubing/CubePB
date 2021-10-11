import { BaseService, NormalService } from "../services";
import { User } from "../../services";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateJoinableField,
  generateTypenameField,
} from "../helpers/typeDef";
import { ObjectTypeDefinition, ObjectTypeDefinitionField } from "giraffeql";

type ServicesObjectMap = {
  [x: string]: {
    allowNull?: boolean;
    service: NormalService;
  };
};

export function generateLinkTypeDef(
  servicesObjectMap: ServicesObjectMap,
  currentService: BaseService,
  additionalFields?: { [x: string]: ObjectTypeDefinitionField }
): ObjectTypeDefinition {
  const typeDefFields = {};

  for (const field in servicesObjectMap) {
    typeDefFields[field] = generateJoinableField({
      service: servicesObjectMap[field].service,
      allowNull: servicesObjectMap[field].allowNull ?? false,
      sqlOptions: { unique: "compositeIndex" },
    });
  }

  return <ObjectTypeDefinition>{
    name: currentService.typename,
    description: "Link type",
    fields: {
      ...generateIdField(),
      ...generateTypenameField(currentService),
      ...typeDefFields,
      ...additionalFields,
      ...generateCreatedAtField(),
      ...generateUpdatedAtField(),
      ...generateCreatedByField(User),
    },
  };
}
