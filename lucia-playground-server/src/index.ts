import express from "express";
import cors from "cors";

import { env } from "./env.js";

import { setupSignup as setupEmailSignup } from "./auth/email/signup.js";
import { setupLogin as setupEmailLogin } from "./auth/email/login.js";

import { setupSignup as setupUsernameSignup } from "./auth/username/signup.js";
import { setupLogin as setupUsernameLogin } from "./auth/username/login.js";

import { setupLogout } from "./auth/logout.js";
import { setupCurrentUser } from "./auth/user.js";
import { setupGoogle } from "./auth/oauth/google.js";
import { setupGithub } from "./auth/oauth/github.js";
import { setupDiscord } from "./auth/oauth/discord.js";

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

const authRouter = express.Router();

// General auth
setupCurrentUser(authRouter);
setupLogout(authRouter);

// Email auth
setupEmailSignup(authRouter);
setupEmailLogin(authRouter);

// Username auth
setupUsernameSignup(authRouter);
setupUsernameLogin(authRouter);

// Google
setupGoogle(authRouter);

// Github
setupGithub(authRouter);

// Discord
setupDiscord(authRouter);

app.use("/auth", authRouter);

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`);
});
