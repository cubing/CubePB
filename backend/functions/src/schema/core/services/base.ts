import {
  ServiceFunctionInputs,
  AccessControlMap,
  ExternalQuery,
} from "../../../types";
import { userPermissionEnum } from "../../enums";
import { lookupSymbol, GiraffeqlRootResolverType } from "giraffeql";
import { badPermissionsError, PermissionsError } from "../helpers/error";

export abstract class BaseService {
  typename: string;

  readonly defaultTypename!: string;

  rootResolvers?: { [x: string]: GiraffeqlRootResolverType };

  presets: ExternalQuery = {
    default: {
      "*": lookupSymbol,
    },
  };

  setRootResolvers(rootResolvers: {
    [x: string]: GiraffeqlRootResolverType;
  }): void {
    this.rootResolvers = rootResolvers;
  }

  // standard ones are 'get', 'getMultiple', 'update', 'create', 'delete'
  accessControl?: AccessControlMap;

  constructor(typename?: string) {
    const camelCaseTypename =
      this.constructor.name.charAt(0).toLowerCase() +
      this.constructor.name.slice(1);
    this.typename = typename ?? camelCaseTypename.replace(/Service$/, "");
  }

  async testPermissions(
    operation: string,
    {
      req,
      fieldPath,
      args,
      query,
      data,
      isAdmin = false,
    }: ServiceFunctionInputs
  ): Promise<boolean> {
    try {
      if (isAdmin) return true;

      // if logged in, attempt to verify permissions using the permissions array
      if (req.user) {
        // check against permissions array first. allow if found.
        const passablePermissionsArray = [
          userPermissionEnum.A_A,
          userPermissionEnum[this.typename + "_x"],
          userPermissionEnum[this.typename + "_" + operation],
        ];

        if (
          req.user.permissions.some((ele) =>
            passablePermissionsArray.includes(ele)
          )
        )
          return true;
      }

      // if that failed, fall back to accessControl
      // deny by default if no accessControl object
      let allowed = false;
      if (this.accessControl) {
        const validatedOperation =
          operation in this.accessControl ? operation : "*";
        // if operation not in the accessControl object, deny
        allowed = this.accessControl[validatedOperation]
          ? await this.accessControl[validatedOperation]({
              req,
              fieldPath,
              args,
              query,
              data,
              isAdmin,
            })
          : false;
      }

      if (!allowed) throw badPermissionsError(fieldPath);

      return allowed;
    } catch (err: unknown) {
      if (err instanceof Error && !(err instanceof PermissionsError)) {
        throw badPermissionsError(fieldPath, err.message);
      }

      throw err;
    }
  }
}
