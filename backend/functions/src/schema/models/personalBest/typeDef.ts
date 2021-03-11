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
} from "../../helpers/typeDef";

export default new JomqlObjectType(<ObjectTypeDefinition>{
  name: PersonalBest.typename,
  description: "Personal Best",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(PersonalBest),
    pb_class: generateJoinableField({
      service: PersonalBestClass,
      allowNull: false,
      sqlDefinition: {
        unique: "compositeIndex",
      },
    }),
    event: generateJoinableField({
      service: Event,
      allowNull: false,
      sqlDefinition: {
        unique: "compositeIndex",
      },
    }),
    set_size: generateIntegerField({
      allowNull: false,
      sqlDefinition: {
        unique: "compositeIndex",
      },
    }),
    score: generateIntegerField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
    }),
    attempts_succeeded: generateIntegerField({
      allowNull: true,
      description: "The number of successful attempts",
    }),
    attempts_total: generateIntegerField({
      allowNull: true,
      description: "The total number of attempts",
    }),
    product: generateJoinableField({
      service: Product,
      allowNull: true,
    }),
    happened_on: generateUnixTimestampField({
      allowNull: false,
    }),
    time_elapsed: generateIntegerField({
      allowNull: true,
      description: "The amount of ms time elapsed for the pb attempt",
    }),
    moves_count: generateIntegerField({
      allowNull: true,
      description: "The amount of moves used in the pb attempt",
    }),
    is_current: generateBooleanField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    // ...generateCreatedByField(User),
    created_by: generateJoinableField({
      service: User,
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
      sqlDefinition: {
        unique: "compositeIndex",
      },
    }),
  },
});
