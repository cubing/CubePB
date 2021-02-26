import { SimpleService } from "../../core/services";
// import * as bcrypt from "bcryptjs";
import * as errorHelper from "../../helpers/error";
import { User } from "../../services";
import { env } from "../../../config";
import axios from "axios";
import { ServiceFunctionInputs } from "../../../types";
import * as sqlHelper from "../../helpers/sql";
import * as Resolver from "../../helpers/resolver";

export class AuthService extends SimpleService {
  defaultTypename = "auth";

  accessControl = {
    "*": (): boolean => true,
  };

  async socialLogin({
    req,
    fieldPath,
    args,
    query,
    isAdmin = false,
  }: ServiceFunctionInputs) {
    // args should be validated already
    const validatedArgs = <any>args;

    //only wca supported at the moment
    if (validatedArgs.provider !== "wca") {
      throw errorHelper.generateError(
        "Invalid social login provider",
        fieldPath
      );
    }

    const wcaSite = axios.create({
      baseURL: env.wca.base_url,
    });

    //get the access token from the code
    const {
      data: { access_token },
    } = await wcaSite.post("oauth/token", {
      grant_type: "authorization_code",
      client_id: env.wca.client_id,
      client_secret: env.wca.client_secret,
      code: validatedArgs.code,
      redirect_uri: validatedArgs.redirect_uri,
    });

    //hit the /me route to get the user info
    const { data: wcaData } = await wcaSite.get("api/v0/me", {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    // lookup user by provider + provider_id
    const userResults = await sqlHelper.fetchTableRows({
      select: [{ field: "id" }, { field: "email" }],
      from: User.typename,
      where: {
        fields: [
          { field: "provider", value: validatedArgs.provider },
          { field: "provider_id", value: wcaData.me.id },
        ],
      },
    });

    let userInfo;

    //not found, create a new user
    if (userResults.length < 1) {
      const addResults = await Resolver.createObjectType({
        typename: User.typename,
        addFields: {
          provider: validatedArgs.provider,
          provider_id: wcaData.me.id,
          wca_id: wcaData.me.wca_id,
          email: wcaData.me.email,
          name: wcaData.me.name,
          avatar: wcaData.me.avatar.url,
          country: wcaData.me.country_iso2,
          created_by: 0,
        },
        req,
        fieldPath,
      });

      // set created_by to id
      await sqlHelper.updateTableRow(
        User.typename,
        {
          created_by: addResults.id,
        },
        {
          fields: [{ field: "id", value: addResults.id }],
        }
      );

      userInfo = {
        id: addResults.id,
        email: wcaData.me.email,
      };
    } else {
      userInfo = userResults[0];
    }

    //if OK, return auth payload
    return this.getRecord({
      req,
      args: {},
      fieldPath,
      query,
      data: {
        id: userInfo.id,
        email: userInfo.email,
      },
    });
  }
}
