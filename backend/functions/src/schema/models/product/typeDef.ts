import { Product, User } from "../../services";
import { JomqlObjectType, ObjectTypeDefinition } from "jomql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
} from "../../helpers/typeDef";

export default new JomqlObjectType(<ObjectTypeDefinition>{
  name: Product.typename,
  description: "Product Type",
  fields: {
    ...generateIdField(),
    ...generateTypenameField(Product),
    name: generateStringField({ allowNull: false }),
    ...generateCreatedAtField(),
    ...generateUpdatedAtField(),
    ...generateCreatedByField(User),
  },
});
