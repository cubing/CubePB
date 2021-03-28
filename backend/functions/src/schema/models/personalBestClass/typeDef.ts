import { PersonalBestClass, User } from "../../services";
import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
  generateTextField,
  generateIntegerField,
} from "../../helpers/typeDef";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
  name: PersonalBestClass.typename,
  description: "Personal Best Type Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(PersonalBestClass),
    name: generateStringField({ allowNull: false }),
    description: generateTextField({ allowNull: true }),
    setSize: generateIntegerField({
      allowNull: true,
      typeDefOptions: { addable: true, updateable: false },
      sqlOptions: { field: "set_size" },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
