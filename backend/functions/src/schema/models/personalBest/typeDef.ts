import {
  Event,
  PersonalBest,
  PersonalBestClass,
  Product,
  User,
} from "../../services";
import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
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
  generateDecimalField,
} from "../../core/helpers/typeDef";
import * as Scalars from "../../scalars";
import * as Resolver from "../../core/helpers/resolver";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
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
    movesCount: generateDecimalField({
      allowNull: true,
      description: "The amount of moves used in the pb attempt",
      sqlOptions: { field: "moves_count" },
    }),
    isCurrent: generateBooleanField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
      sqlOptions: { field: "is_current" },
    }),
    ranking: {
      type: Scalars.number,
      description:
        "The numerical score rank of this PB given its event, pbClass, and setSize, among public PBs only",
      allowNull: true,
      requiredSqlFields: [
        "score",
        "event.id",
        "pbClass.id",
        "setSize",
        "isCurrent",
        "createdBy.isPublic",
      ],
      async resolver({ parentValue, fieldPath }) {
        // if not a current PB or user is not public, return null
        if (!parentValue.isCurrent || !parentValue.createdBy.isPublic)
          return null;

        const resultsCount = await Resolver.countObjectType(
          "personalBest",
          fieldPath,
          {
            fields: [
              {
                field: "score",
                operator: "lt",
                value: parentValue.score,
              },
              {
                field: "event.id",
                operator: "eq",
                value: parentValue.event.id,
              },
              {
                field: "pbClass.id",
                operator: "eq",
                value: parentValue.pbClass.id,
              },
              {
                field: "setSize",
                operator: "eq",
                value: parentValue.setSize,
              },
              {
                field: "createdBy.isPublic",
                operator: "eq",
                value: true,
              },
              {
                field: "isCurrent",
                operator: "eq",
                value: true,
              },
            ],
          },
          true
        );

        return resultsCount + 1;
      },
    },
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
