import { Github } from "../../services";
import * as Scalars from "../../scalars";
import {
  GiraffeqlInputFieldType,
  GiraffeqlInputType,
  GiraffeqlRootResolverType,
} from "giraffeql";

export default {
  getRepositoryReleases: new GiraffeqlRootResolverType({
    name: "getRepositoryReleases",
    restOptions: {
      method: "get",
      route: "/repositoryReleases",
    },
    type: Scalars.unknown,
    allowNull: false,
    arrayOptions: {
      allowNullElement: false,
    },
    args: new GiraffeqlInputFieldType({
      required: true,
      type: new GiraffeqlInputType({
        name: "getRepositoryReleases",
        description: "Input object for getRepositoryReleases",
        fields: {
          first: new GiraffeqlInputFieldType({
            type: Scalars.number,
            required: true,
          }),
        },
      }),
    }),
    resolver: (inputs) => Github.getRepositoryReleases(inputs),
  }),

  getRepositoryLatestVersion: new GiraffeqlRootResolverType({
    name: "getRepositoryLatestVersion",
    restOptions: {
      method: "get",
      route: "/repositoryLatestVersion",
    },
    type: Scalars.unknown,
    allowNull: true,
    resolver: (inputs) => Github.getRepositoryLatestVersion(inputs),
  }),
};
