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
  generateCreatedByField,
  generateTypenameField,
  generateJoinableField,
  generateIntegerField,
  generateBooleanField,
  generateDateField,
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
      defaultValue: 1,
      description: "The number of successful attempts",
    }),
    attempts_total: generateIntegerField({
      allowNull: false,
      defaultValue: 1,
      description: "The total number of attempts",
    }),
    product: generateJoinableField({
      service: Product,
      allowNull: true,
    }),
    happened_on: generateDateField({
      allowNull: false,
    }),
    time_elapsed: generateIntegerField({
      allowNull: false,
      description: "The amount of ms time elapsed for the pb attempt",
    }),
    show_ms: generateBooleanField({
      allowNull: false,
      defaultValue: false,
    }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
