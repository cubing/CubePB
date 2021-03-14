# CubePB Frontend Client

## Environment Variables

Copy the `.env.example` file (recommended) to `.env`, or supply your own environment variables.

## Serve Locally with Hot Reloading

```bash
# set working directory
$ cd frontend

# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```

## Generate and Serve Project

This step is generally not needed unless you are planning on deploying the project to a website.

```bash
# generate static project
$ npm run generate
```

## Backend API Schema

The backend API uses jomql as the query language. It expose a schema file that roughly describe the backend models and what query operations can be performed. The TypeScript schema file can be found [here](https://api.cubepb.com/schema.ts). By pasting the `schema.ts` file into a code editor like VSCode, you can use the Query Builder located at the top of the file to formulate jomql queries.

## More Info

This frontend uses the nuxt.js framework. For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
