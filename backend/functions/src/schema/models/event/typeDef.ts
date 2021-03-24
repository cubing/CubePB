import { Event, User } from "../../services";
import { JomqlObjectType, ObjectTypeDefinition } from "jomql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
  generateEnumField,
} from "../../helpers/typeDef";
import * as Scalars from "../../scalars";

export default new JomqlObjectType(<ObjectTypeDefinition>{
  name: Event.typename,
  description: "Event Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(Event),
    name: generateStringField({ allowNull: false }),
    code: generateStringField({
      allowNull: false,
      sqlOptions: {
        unique: true,
      },
    }),
    cubingIcon: generateStringField({
      allowNull: true,
      sqlOptions: {
        field: "cubing_icon",
      },
    }),
    scoreMethod: generateEnumField({
      scalarDefinition: Scalars.scoreMethod,
      allowNull: false,
      sqlOptions: { field: "score_method" },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
