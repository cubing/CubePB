import { Github } from "../../services";
import * as Scalars from "../../scalars";
import {
  JomqlInputFieldType,
  JomqlInputType,
  JomqlRootResolverType,
} from "jomql";

export default {
  getRepositoryReleases: new JomqlRootResolverType({
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
    args: new JomqlInputFieldType({
      required: true,
      type: new JomqlInputType({
        name: "getRepositoryReleases",
        description: "Input object for getRepositoryReleases",
        fields: {
          first: new JomqlInputFieldType({
            type: Scalars.number,
            required: true,
          }),
        },
      }),
    }),
    resolver: (inputs) => Github.getRepositoryReleases(inputs),
  }),

  getRepositoryLatestVersion: new JomqlRootResolverType({
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
