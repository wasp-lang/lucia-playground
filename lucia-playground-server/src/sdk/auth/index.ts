import { Router } from "express";

import { setupCurrentUser } from "./user.js";
import { setupLogout } from "./logout.js";
import { setupEmailAuth } from "./email/index.js";
import { setupUsernameAuth } from "./username/index.js";
import { setupExchangeCode } from "./oauth/exchangeCode.js";
import { setupGoogle } from "./oauth/google.js";
import { setupGithub } from "./oauth/github.js";
import { setupDiscord } from "./oauth/discord.js";
import { setupKeycloak } from "./oauth/keycloak.js";

const availableOAuthProviders = {
  google: setupGoogle,
  github: setupGithub,
  discord: setupDiscord,
  keycloak: setupKeycloak,
} as const;

const oAuthProviderKeys = Object.keys(availableOAuthProviders);

const availableProviders = {
  email: setupEmailAuth,
  username: setupUsernameAuth,
  ...availableOAuthProviders,
} as const;

type Provider = keyof typeof availableProviders;

export function setupAuth(providers: Provider[]): Router {
  const authRouter = Router();

  // General auth
  setupCurrentUser(authRouter);
  setupLogout(authRouter);

  // Set up auth for each provider
  for (let provider of providers) {
    availableProviders[provider](authRouter);
  }

  if (providers.some((provider) => oAuthProviderKeys.includes(provider))) {
    setupExchangeCode(authRouter);
  }

  return authRouter;
}
