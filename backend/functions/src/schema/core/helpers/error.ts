import { GiraffeqlBaseError } from "giraffeql";

export function generateError(
  message: string,
  fieldPath: string[],
  statusCode = 400
): GiraffeqlBaseError {
  return new GiraffeqlBaseError({
    message,
    fieldPath,
    statusCode,
  });
}

export function itemNotFoundError(fieldPath: string[]): GiraffeqlBaseError {
  return generateError("Record was not found", fieldPath, 404);
}

export function badPermissionsError(fieldPath: string[]): GiraffeqlBaseError {
  return generateError("Insufficient permissions", fieldPath, 401);
}

export function invalidSqlError(): GiraffeqlBaseError {
  return generateError("Insufficient permissions", [], 401);
}
