import { GiraffeqlScalarType } from "giraffeql";

export const json = new GiraffeqlScalarType({
  name: "json",
  types: ["unknown"],
  description: "Valid JSON",
});
