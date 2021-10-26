import { LegacyRecord, User } from "../../services";
import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateTypenameField,
  generateIntegerField,
  generateUnixTimestampField,
  generateCreatedByField,
  generateStringField,
} from "../../core/helpers/typeDef";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
  name: LegacyRecord.typename,
  description: "Legacy Record",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(LegacyRecord),
    wcaEventId: generateStringField({
      allowNull: true,
      sqlOptions: { field: "wca_event_id" },
    }),
    recordType: generateIntegerField({
      allowNull: false,
      sqlOptions: { field: "record_type" },
    }),
    numberOfSolves: generateIntegerField({
      allowNull: false,
      sqlOptions: { field: "number_of_solves" },
    }),
    result: generateIntegerField({
      allowNull: false,
    }),
    otherEventName: generateStringField({
      allowNull: true,
      sqlOptions: { field: "other_event_name" },
    }),
    mainCube: generateStringField({
      allowNull: true,
      sqlOptions: { field: "main_cube" },
    }),
    eventType: generateIntegerField({
      allowNull: false,
      sqlOptions: { field: "event_type" },
    }),
    date: generateUnixTimestampField({
      allowNull: true,
    }),
    email: generateStringField({
      allowNull: false,
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
