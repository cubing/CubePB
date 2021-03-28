import { Product, User } from "../../services";
import { GiraffeqlObjectType, ObjectTypeDefinition } from "giraffeql";
import {
  generateIdField,
  generateCreatedAtField,
  generateUpdatedAtField,
  generateCreatedByField,
  generateStringField,
  generateTypenameField,
} from "../../helpers/typeDef";

export default new GiraffeqlObjectType(<ObjectTypeDefinition>{
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
