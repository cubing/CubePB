import { GiraffeqlScalarType } from "giraffeql";

function validate(value: unknown) {
  if (typeof value !== "string" && !(value instanceof RegExp)) {
    throw true;
  }

  return new RegExp(value);
}

export const regex = new GiraffeqlScalarType({
  name: "regex",
  types: ["RegExp"],
  description: "Regex Field",
  parseValue: validate,
  serialize: validate,
});
