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
      allowNull: false,
      description: "The number of successful attempts",
    }),
    attempts_total: generateIntegerField({
      allowNull: false,
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
      allowNull: false,
      description: "The amount of ms time elapsed for the pb attempt",
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
