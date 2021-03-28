import { GiraffeqlScalarType } from "giraffeql";

function validate(value) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!regEx.test(value)) throw true; // Invalid format
  const d = new Date(value);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) throw true; // NaN value, Invalid date
  if (d.toISOString().slice(0, 10) !== value) throw true;

  return value;
}

export const date = new GiraffeqlScalarType({
  name: "date",
  types: ["string"],
  description: "Date YYYY-MM-DD",
  serialize: (value) => {
    if (!(value instanceof Date)) throw true;
    return value.toISOString().split("T")[0];
  },
  parseValue: validate,
});
