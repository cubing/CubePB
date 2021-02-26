import { PersonalBestClass, User } from "../../services";
import { JomqlObjectType, ObjectTypeDefinition } from "jomql";
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

export default new JomqlObjectType(<ObjectTypeDefinition>{
  name: PersonalBestClass.typename,
  description: "Personal Best Type Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(PersonalBestClass),
    name: generateStringField({ allowNull: false }),
    description: generateTextField({ allowNull: true }),
    set_size: generateIntegerField({
      allowNull: true,
      typeDefOptions: { addable: true, updateable: false },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
