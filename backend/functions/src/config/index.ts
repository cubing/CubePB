import * as functions from "firebase-functions";

export const isDev = process.env.DEV;

export const env = isDev ? require("../../../env.json") : functions.config();

const now = new Date().toTimeString(); // will be different per CF instance

export const giraffeqlOptions = {
  debug: !!isDev,
  lookupValue: true,
  route: "/giraffeql",
  processEntireTree: false,
};

export const pgProductionOptions = {
  client: "pg",
  connection: {
    host: env.pg.host,
    user: env.pg.user,
    password: env.pg.password,
    database: env.pg.database,
    ...(env.pg.port && { port: env.pg.port }),
    application_name: `instance ${now})`,
  },
  pool: { min: 0, max: 1 },
};

export const pgDevOptions = env.pg_dev
  ? {
      client: "pg",
      connection: {
        host: env.pg_dev.host,
        user: env.pg_dev.user,
        password: env.pg_dev.password,
        database: env.pg_dev.database,
        ...(env.pg_dev.port && { port: env.pg_dev.port }),
        application_name: `instance ${now})`,
      },
      pool: { min: 0, max: 1 },
    }
  : null;

export const pgOptions = isDev ? pgDevOptions : pgProductionOptions;
