import { JomqlScalarType } from "jomql";

export const json = new JomqlScalarType({
  name: "json",
  types: ["unknown"],
  description: "Valid JSON",
});
