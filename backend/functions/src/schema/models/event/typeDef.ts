import { Event, User } from "../../services";
import { JomqlObjectType, ObjectTypeDefinition } from "jomql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
  generateIntegerField,
} from "../../helpers/typeDef";

export default new JomqlObjectType(<ObjectTypeDefinition>{
  name: Event.typename,
  description: "Event Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(Event),
    name: generateStringField({ allowNull: false }),
    code: generateStringField({
      allowNull: false,
      sqlDefinition: {
        unique: true,
      },
    }),
    max_attempts: generateIntegerField({
      allowNull: false,
      defaultValue: 1,
      typeDefOptions: { addable: true, updateable: false },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
