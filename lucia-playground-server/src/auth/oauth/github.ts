import { Router } from "express";
import { github } from "@lucia-auth/oauth/providers";

import { setupProviderHandlers } from "./utils.js";
import { auth } from "../../lucia.js";
import { env } from "../../env.js";

const name = "github";

const githubAuth = github(auth, {
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  // This callback URL needs to be set in Github's UI:
  // http://localhost:3001/auth/login/github/callback,
});

export function setupGithub(router: Router) {
  setupProviderHandlers(router, name, githubAuth, (providerData) => {
    return providerData.githubUser;
  });
}
