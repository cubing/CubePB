import { Event, User } from "../../services";
import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
  generateEnumField,
} from "../../core/helpers/typeDef";
import * as Scalars from "../../scalars";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
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
