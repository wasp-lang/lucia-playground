import { Router } from "express";
import { Discord } from "arctic";

import { getRedirectUri, setupProviderHandlers } from "./utils.js";
import { env } from "../../env.js";

const name = "discord";

const discord = new Discord(
  env.DISCORD_CLIENT_ID,
  env.DISCORD_CLIENT_SECRET,
  getRedirectUri(name),
  {
    scope: ["identify", "email"],
  }
);

export function setupDiscord(router: Router) {
  setupProviderHandlers(router, name, discord, (user) => {
    return user;
  });
}
