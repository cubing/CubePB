import * as functions from "firebase-functions";
import * as express from "express";

import { initializeGiraffeql } from "giraffeql";
import "./schema";
import { env, giraffeqlOptions } from "./config";

import { initializePusher } from "./utils/pusher";
import { handlePusherAuth } from "./helpers/pusher";
import { validateToken } from "./helpers/auth";
import { CustomSchemaGenerator } from "./helpers/schema";

const app = express();

const allowedOrigins = [
  "https://cubepb.com",
  "https://alpha.cubepb.com",
  "http://localhost:3000",
];

// extract the user ID from all requests.
app.use(async function (req, res, next) {
  try {
    if (req.headers.authorization) {
      req.user = await validateToken(req.headers.authorization);
    }

    // handle origins -- only accepting string type origins.
    const origin =
      Array.isArray(allowedOrigins) && allowedOrigins.length
        ? typeof req.headers.origin === "string" &&
          allowedOrigins.includes(req.headers.origin)
          ? req.headers.origin
          : allowedOrigins[0]
        : "*";

    res.header("Access-Control-Allow-Origin", origin);
    if (origin !== "*") {
      res.header("Vary", "Origin");
    }

    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, GET, DELETE, OPTIONS"
    );
  } catch (err) {
    console.log(err);
  }
  next();
});

app.options("*", function (req, res, next) {
  res.header("Access-Control-Max-Age", "86400");
  res.sendStatus(200);
});

// initialize pusher
env.pusher && initializePusher(env.pusher);

initializeGiraffeql(app, giraffeqlOptions);

app.get("/schema.ts", function (req, res, next) {
  res.header("Content-Type", "text/plain");
  const tsSchemaGenerator = new CustomSchemaGenerator(giraffeqlOptions);
  tsSchemaGenerator.buildSchema();
  tsSchemaGenerator.processSchema();
  res.send(tsSchemaGenerator.outputSchema());
});

export const api = functions.https.onRequest(app);

app.post("/pusher/auth", handlePusherAuth);
