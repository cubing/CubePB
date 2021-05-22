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
  generateTextField,
  generateBooleanField,
} from "../../core/helpers/typeDef";
import * as Scalars from "../../scalars";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
  name: Event.typename,
  description: "Event Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(Event),
    name: generateStringField({ allowNull: false }),
    description: generateTextField({ allowNull: true }),
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
    isSubEvent: generateBooleanField({
      allowNull: false,
      defaultValue: false,
      sqlOptions: {
        field: "is_sub_event",
      },
    }),
    isWcaEvent: generateBooleanField({
      allowNull: false,
      defaultValue: false,
      sqlOptions: {
        field: "is_wca_event",
      },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
