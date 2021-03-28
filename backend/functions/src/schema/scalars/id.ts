import { GiraffeqlScalarType } from "giraffeql";

function validate(value: unknown) {
  const parsedValue = Number(value);
  if (Number.isNaN(Number(value))) throw true;

  return parsedValue;
}

export const id = new GiraffeqlScalarType({
  name: "id",
  types: ["number"],
  description: "ID Field",
  parseValue: validate,
  serialize: validate,
});
