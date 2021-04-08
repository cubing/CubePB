import { SimpleService } from "../../core/services";
// import * as bcrypt from "bcryptjs";
import * as errorHelper from "../../core/helpers/error";
import { User } from "../../services";
import { env } from "../../../config";
import axios from "axios";
import { ServiceFunctionInputs } from "../../../types";
import * as sqlHelper from "../../core/helpers/sql";
import * as Resolver from "../../core/helpers/resolver";
import { userRoleKenum } from "../../enums";

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
      redirect_uri: validatedArgs.redirectUri,
    });

    //hit the /me route to get the user info
    const { data: wcaData } = await wcaSite.get("api/v0/me", {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    // lookup user by provider + providerId
    const userResults = await sqlHelper.fetchTableRows({
      select: [{ field: "id" }, { field: "email" }],
      from: User.typename,
      where: {
        fields: [
          { field: "provider", value: validatedArgs.provider },
          { field: "providerId", value: wcaData.me.id },
        ],
      },
    });

    let userInfo;

    // not found, create a new user
    if (userResults.length < 1) {
      const addResults = await Resolver.createObjectType({
        typename: User.typename,
        addFields: {
          provider: validatedArgs.provider,
          providerId: wcaData.me.id,
          wcaId: wcaData.me.wca_id,
          email: wcaData.me.email,
          name: wcaData.me.name,
          avatar: wcaData.me.avatar.thumb_url,
          country: wcaData.me.country_iso2,
          role: userRoleKenum.NORMAL.parsed,
          createdBy: 0,
        },
        req,
        fieldPath,
      });

      // set createdBy to id
      await sqlHelper.updateTableRow(
        {
          table: User.typename,
          fields: {
            createdBy: addResults.id,
          },
          where: {
            fields: [{ field: "id", value: addResults.id }],
          },
        },
        fieldPath
      );

      userInfo = {
        id: addResults.id,
        email: wcaData.me.email,
      };
    } else {
      // if found, force update wca_id, email, name, avatar, country fields
      await sqlHelper.updateTableRow(
        {
          table: User.typename,
          fields: {
            wcaId: wcaData.me.wca_id,
            email: wcaData.me.email,
            name: wcaData.me.name,
            avatar: wcaData.me.avatar.thumb_url,
            country: wcaData.me.country_iso2,
          },
          where: {
            fields: [{ field: "id", value: userResults[0].id }],
          },
        },
        fieldPath
      );

      userInfo = {
        id: userResults[0].id,
        email: wcaData.me.email,
      };
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
