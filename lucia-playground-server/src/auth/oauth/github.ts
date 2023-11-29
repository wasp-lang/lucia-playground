import { Router } from "express";
import { GitHub } from "arctic";

import { setupProviderHandlers } from "./utils.js";
import { env } from "../../env.js";

const name = "github";

const githubAuth = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, {
  scope: ["user:email"],
});

export function setupGithub(router: Router) {
  setupProviderHandlers(router, name, githubAuth, (user) => {
    return user;
  });
}
