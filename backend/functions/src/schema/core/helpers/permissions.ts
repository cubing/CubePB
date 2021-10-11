import { BaseService, NormalService } from "../services";
import * as errorHelper from "./error";
import { ServiceFunctionInputs, AccessControlFunction } from "../../../types";

export function permissionsCheck(methodKey: string) {
  return function (
    target: BaseService,
    propertyName: string,
    propertyDescriptor: PropertyDescriptor
  ): PropertyDescriptor {
    // target === Employee.prototype
    // propertyName === "greet"
    // propertyDesciptor === Object.getOwnPropertyDescriptor(Employee.prototype, "greet")
    const method = propertyDescriptor.value;

    propertyDescriptor.value = async function ({
      req,
      fieldPath,
      args,
      query,
      data,
      isAdmin = false,
    }: ServiceFunctionInputs) {
      //if it does not pass the access control, throw an error

      if (
        !(await target.testPermissions.apply(this, [
          methodKey,
          {
            req,
            fieldPath,
            args,
            query,
            data,
            isAdmin,
          },
        ]))
      ) {
        // if returns false, fallback to a generic bad permissions error
        throw errorHelper.badPermissionsError(fieldPath);
      }

      // invoke greet() and get its return value
      const result = await method.apply(this, [
        {
          req,
          fieldPath,
          args,
          query,
          data,
          isAdmin,
        },
      ]);

      // return the result of invoking the method
      return result;
    };
    return propertyDescriptor;
  };
}
