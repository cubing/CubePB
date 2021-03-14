# CubePB

CubePB is a website for storing and showcasing your personal bests in cubing-related events.

## Contributing

The project is actively being developed and we welcome any contributions! Please join our [Discord server](https://discord.gg/syZfxBpT) if you'd like to help out in any way. You can also join the [cubing slack](https://join.slack.com/t/cubing-org/shared_invite/zt-8ok0y7cl-CffvDqFxnp9LheabPzmfgw) to learn more about the cubing organization and how you can get involved.

To familiarize yourself with the project, we would recommend checking out the [frontend client](./frontend) readme. There, you will find instructions on how to set up the client and get it working on your local computer, where you will be able to make changes and see the effects immediately.

The backend API source code can be found [here](./backend). However, we would strongly recommend using the official live API at https://api.cubepb.com instead of hosting the API locally, due to numerous requirements of setting up the local testing environment.

## Backend API Schema

The backend API uses jomql as the query language. It expose a schema file that roughly describe the backend models and what query operations can be performed. The TypeScript schema file can be found [here](https://api.cubepb.com/schema.ts). By pasting the `schema.ts` file into a code editor like VSCode, you can use the Query Builder located at the top of the file to formulate jomql queries.

## License

This project is licensed under the GPL license (version 3 or later). This means that the code is **free to use**, although you **must publish any code that uses it** (e.g. also put it on GitHub). See [the full license](./LICENSE) for exact details.

We've selected this license in order to encourage the cubing community to work on software in a way so that everyone can contribute and extend each other's work.
