import { Router } from "express";
import { discord } from "@lucia-auth/oauth/providers";

import { getRedirectUri, setupProviderHandlers } from "./utils.js";
import { auth } from "../../lucia.js";
import { env } from "../../env.js";

const name = "discord";

const discordAuth = discord(auth, {
  clientId: env.DISCORD_CLIENT_ID,
  clientSecret: env.DISCORD_CLIENT_SECRET,
  redirectUri: getRedirectUri(name),
  scope: ["identify", "email"],
});

export function setupDiscord(router: Router) {
  setupProviderHandlers(router, name, discordAuth, (providerData) => {
    return providerData.discordUser;
  });
}
