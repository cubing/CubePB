import { Event, User } from "../../services";
import { JomqlObjectType, ObjectTypeDefinition } from "jomql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
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
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
