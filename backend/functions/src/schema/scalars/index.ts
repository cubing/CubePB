import {
  generateKenumScalarDefinition,
  generateEnumScalarDefinition,
} from "../helpers/scalar";
import { userRoleKenum, userPermissionEnum, scoreMethodEnum } from "../enums";

import { BaseScalars, GiraffeqlScalarType } from "giraffeql";

// base scalars
export const string = BaseScalars.string;
// export const number = BaseScalars.number;
export const boolean = BaseScalars.boolean;
export const unknown = BaseScalars.unknown;

// added scalars
export { number } from "./number"; // replacing the built-in number type to automatically parse Number-like strings
export { imageUrl } from "./imageUrl";
export { unixTimestamp } from "./unixTimestamp";
export { date } from "./date";
export { id } from "./id";
export { regex } from "./regex";
export { json } from "./json";
export { jsonString } from "./jsonString";

// generated scalars
export const userRole = new GiraffeqlScalarType(
  generateKenumScalarDefinition("userRole", userRoleKenum)
);

export const userPermission = new GiraffeqlScalarType(
  generateEnumScalarDefinition("userPermission", userPermissionEnum)
);

export const scoreMethod = new GiraffeqlScalarType(
  generateEnumScalarDefinition("scoreMethod", scoreMethodEnum)
);
