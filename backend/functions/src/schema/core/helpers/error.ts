import { GiraffeqlBaseError } from "giraffeql";

export class PermissionsError extends GiraffeqlBaseError {
  constructor(params: { message: string; fieldPath: string[] }) {
    const { message, fieldPath } = params;
    super({
      errorName: "PermissionsError",
      message,
      fieldPath,
      statusCode: 401,
    });
  }
}

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

export function badPermissionsError(
  fieldPath: string[],
  message?: string
): PermissionsError {
  return generateError(message ?? "Insufficient permissions", fieldPath, 401);
}

export function invalidSqlError(): GiraffeqlBaseError {
  return generateError("Insufficient permissions", [], 401);
}
