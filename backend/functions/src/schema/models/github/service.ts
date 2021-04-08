import { BaseService } from "../../core/services";
import { permissionsCheck } from "../../core/helpers/permissions";
import { ServiceFunctionInputs } from "../../../types";
import { env } from "../../../config";
import axios from "axios";
import { GiraffeqlBaseError } from "giraffeql";

const graphqlApi = axios.create({
  baseURL: "https://api.github.com",
});

async function sendGraphqlRequest(graphqlQuery) {
  const request = {
    headers: {
      Authorization: "Bearer " + env.github.token,
    },
  };

  const params = {
    query: graphqlQuery,
  };
  const { data } = await graphqlApi.post("/graphql", params, request);
  return data.data;
}

export class GithubService extends BaseService {
  accessControl = {
    get: () => true,
  };

  @permissionsCheck("get")
  async getRepositoryReleases({
    req,
    fieldPath,
    args,
    query,
    isAdmin = false,
  }: ServiceFunctionInputs): Promise<any> {
    try {
      // args should be validated already
      const validatedArgs = <any>args;

      if (env.github.organization) {
        const response = await sendGraphqlRequest(`
query { 
  viewer { 
    organization(login: "${env.github.organization}") {
      repository(name: "${env.github.repository}") {
        releases(first: ${validatedArgs.first}, orderBy: {
          field: CREATED_AT,
          direction: DESC
        }) {
          edges {
            node {
              id
              tagName
              name
              descriptionHTML
              isLatest
              createdAt
            }
          }
        }
      }
    }
  }
}
    `);

        return response.viewer.organization.repository.releases.edges.map(
          (edge) => edge.node
        );
      } else {
        // if no organization specified, lookup repository directly
        const response = await sendGraphqlRequest(`
query { 
  viewer { 
    repository(name: "${env.github.repository}") {
      releases(first: ${validatedArgs.first}, orderBy: {
        field: CREATED_AT,
        direction: DESC
      }) {
        edges {
          node {
            id
            tagName
            name
            descriptionHTML
            isLatest
            createdAt
          }
        }
      }
    }
  }
}
    `);

        return response.viewer.repository.releases.edges.map(
          (edge) => edge.node
        );
      }
    } catch (err) {
      throw new GiraffeqlBaseError({
        message:
          "Unable to fetch the requested data from the repository provider",
        fieldPath,
      });
    }
  }

  @permissionsCheck("get")
  async getRepositoryLatestVersion({
    req,
    fieldPath,
    args,
    query,
    isAdmin = false,
  }: ServiceFunctionInputs): Promise<any> {
    try {
      // args should be validated already
      const validatedArgs = <any>args;

      if (env.github.organization) {
        const response = await sendGraphqlRequest(`
query { 
  viewer { 
    organization(login: "${env.github.organization}") {
      repository(name: "${env.github.repository}") {
        latestRelease {
          tagName
        }
      }
    }
  }
}
    `);

        return response.viewer.organization.repository.latestRelease?.tagName;
      } else {
        // if no organization specified, lookup repository directly
        const response = await sendGraphqlRequest(`
query { 
  viewer { 
    repository(name: "${env.github.repository}") {
      latestRelease {
        tagName
      }
    }
  }
}
    `);

        return response.viewer.repository.latestRelease?.tagName;
      }
    } catch (err) {
      throw new GiraffeqlBaseError({
        message:
          "Unable to fetch the requested data from the repository provider",
        fieldPath,
      });
    }
  }
}
