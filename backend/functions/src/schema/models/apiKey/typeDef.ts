import { ApiKey, User } from "../../services";
import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
  generateJoinableField,
  generateArrayField,
} from "../../core/helpers/typeDef";
import * as Scalars from "../../scalars";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
  name: ApiKey.typename,
  description: "API Key Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(ApiKey),
    name: generateStringField({ allowNull: false }),
    code: generateStringField({
      allowNull: false,
      sqlOptions: {
        unique: true,
      },
      typeDefOptions: { addable: false, updateable: false }, // auto-generated
    }),
    user: generateJoinableField({
      service: User,
      allowNull: false,
    }),
    permissions: generateArrayField({
      allowNull: true,
      type: Scalars.userPermission,
      nestHidden: true,
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
