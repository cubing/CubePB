# CubePB Backend API

This is the source code for the backend API of CubePB. Due to the nuances and numerous requirements involved with getting the backend up and running on your local development server, we recommend using the official live API at https://api.cubepb.com for testing or client development purposes instead. Feel free to drop by the official [Discord server](https://discord.gg/syZfxBpT) if you have any questions about the backend APIs.

## Overview

The CubePB Backend source has been configured for use with Firebase Cloud Functions using the Node 14 runtime. It connects to a PostgreSQL database using Knex.js. Database migrations and seeding are managed in the `functions/db` directory, also using Knex.js. It uses [GiraffeQL](https://github.com/big213/giraffeql) as the querying language, which is an open-source package similar to GraphQL. Much of the backend is derived from a giraffeql boilerplate project. The business logic that pertains to this specific project can be mostly found in the [models](https://github.com/cubing/CubePB/tree/main/backend/functions/src/schema/models) directory.

## API Schema

The GiraffeQL API exposes a schema file that roughly describe the backend models and what query operations can be performed. The TypeScript schema file can be found [here](https://api.cubepb.com/schema.ts). By pasting the `schema.ts` file into a code editor like VSCode, you can use the Query Builder located at the top of the file to form giraffeql queries.
