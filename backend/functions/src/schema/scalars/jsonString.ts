import { JomqlScalarType } from "jomql";

export const jsonString = new JomqlScalarType({
  name: "jsonString",
  types: ["string"],
  description: "Valid JSON as a string",
  parseValue: (value: unknown) => {
    if (typeof value !== "string") throw true;
    // ensure it is valid JSON
    JSON.parse(value);
    return value;
  },
  serialize: (value: unknown) => {
    return value === null ? null : JSON.stringify(value);
  },
});
