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
  generateTextField,
} from "../../core/helpers/typeDef";
import * as Scalars from "../../scalars";
import * as Resolver from "../../core/helpers/resolver";
import { knex } from "../../../utils/knex";

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
      typeDefOptions: { addable: true, updateable: false },
    }),
    event: generateJoinableField({
      service: Event,
      allowNull: false,
      typeDefOptions: { addable: true, updateable: false },
    }),
    setSize: generateIntegerField({
      allowNull: false,
      sqlOptions: {
        field: "set_size",
      },
      typeDefOptions: { addable: true, updateable: false },
    }),
    score: generateIntegerField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
    }),
    attemptsSucceeded: generateIntegerField({
      allowNull: true,
      description: "The number of successful attempts",
      sqlOptions: { field: "attempts_succeeded" },
      typeDefOptions: { addable: true, updateable: false },
    }),
    attemptsTotal: generateIntegerField({
      allowNull: true,
      description: "The total number of attempts",
      sqlOptions: { field: "attempts_total" },
      typeDefOptions: { addable: true, updateable: false },
    }),
    product: generateJoinableField({
      service: Product,
      allowNull: true,
    }),
    happenedOn: generateUnixTimestampField({
      allowNull: false,
      defaultValue: knex.fn.now(), // not really setting via DB. default is calculated manually in the createRecord function
      sqlOptions: { field: "happened_on" },
      typeDefOptions: { addable: true, updateable: false },
    }),
    timeElapsed: generateIntegerField({
      allowNull: true,
      description: "The amount of ms time elapsed for the pb attempt",
      sqlOptions: { field: "time_elapsed" },
      typeDefOptions: { addable: true, updateable: false },
    }),
    movesCount: generateDecimalField({
      allowNull: true,
      description: "The amount of moves used in the pb attempt",
      sqlOptions: { field: "moves_count" },
      typeDefOptions: { addable: true, updateable: false },
    }),
    isCurrent: generateBooleanField({
      allowNull: false,
      typeDefOptions: { addable: false, updateable: false },
      sqlOptions: { field: "is_current" },
    }),
    isFlagged: generateBooleanField({
      allowNull: false,
      defaultValue: false,
      typeDefOptions: { addable: false, updateable: true },
      sqlOptions: { field: "is_flagged" },
    }),
    publicComments: generateTextField({
      allowNull: true,
      sqlOptions: {
        field: "public_comments",
      },
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
        "isFlagged",
        "createdBy.isPublic",
      ],
      async resolver({ parentValue, fieldPath }) {
        // if not a current PB or user is not public or isFlagged, return null
        if (
          !parentValue.isCurrent ||
          !parentValue.createdBy.isPublic ||
          parentValue.isFlagged
        )
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
              {
                field: "isFlagged",
                operator: "eq",
                value: false,
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
