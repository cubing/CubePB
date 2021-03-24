import {
  Event,
  PersonalBest,
  PersonalBestClass,
  Product,
  User,
} from "../../services";
import { JomqlObjectType, ObjectTypeDefinition } from "jomql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateTypenameField,
  generateJoinableField,
  generateIntegerField,
  generateUnixTimestampField,
  generateBooleanField,
  generateCreatedByField,
} from "../../helpers/typeDef";

export default new JomqlObjectType(<ObjectTypeDefinition>{
  name: PersonalBest.typename,
  description: "Personal Best",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(PersonalBest),
    pbClass: generateJoinableField({
      service: PersonalBestClass,
      allowNull: false,
      sqlOptions: {
        field: "pb_class",
      },
    }),
    event: generateJoinableField({
      service: Event,
      allowNull: false,
    }),
    setSize: generateIntegerField({
      allowNull: false,
      sqlOptions: {
        field: "set_size",
      },
    }),
    score: generateIntegerField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
    }),
    attemptsSucceeded: generateIntegerField({
      allowNull: true,
      description: "The number of successful attempts",
      sqlOptions: { field: "attempts_succeeded" },
    }),
    attemptsTotal: generateIntegerField({
      allowNull: true,
      description: "The total number of attempts",
      sqlOptions: { field: "attempts_total" },
    }),
    product: generateJoinableField({
      service: Product,
      allowNull: true,
    }),
    happenedOn: generateUnixTimestampField({
      allowNull: false,
      sqlOptions: { field: "happened_on" },
    }),
    timeElapsed: generateIntegerField({
      allowNull: true,
      description: "The amount of ms time elapsed for the pb attempt",
      sqlOptions: { field: "time_elapsed" },
    }),
    movesCount: generateIntegerField({
      allowNull: true,
      description: "The amount of moves used in the pb attempt",
      sqlOptions: { field: "moves_count" },
    }),
    isCurrent: generateBooleanField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
      sqlOptions: { field: "is_current" },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
