import express from "express";
import cors from "cors";

import { env } from "./env.js";

import { setupAuth } from "./sdk/index.js";

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

const auth = setupAuth([
  "email",
  "username",
  "google",
  "github",
  "discord",
  "keycloak",
]);

app.use("/auth", auth);

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
