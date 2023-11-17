import { lucia } from "lucia";
import { express } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";
import { prismaClient } from "./prisma.js";

import { github } from "@lucia-auth/oauth/providers";
import { google } from "@lucia-auth/oauth/providers";
import { discord } from "@lucia-auth/oauth/providers";

// If you’re using Node.js version 18 or below, you need to polyfill
// the Web Crypto API. This is not required if you’re using Node.js v20
// and above.
import "lucia/polyfill/node";
import { env } from "./env.js";

export const auth = lucia({
  env: "DEV",
  // Lucia validates the requests by checking if
  // * they came from same origin
  // * or they came form a whitelisted subdomain
  // "csrfProtection" must be "false" if you have different doamins for frontend and backend 🤷‍♂️
  csrfProtection: false,
  middleware: express(),
  adapter: prisma(prismaClient, {
    user: "auth",
    session: "session",
    key: "key",
  }),
});

export const githubAuth = github(auth, {
  clientId: env.GITHUB_CLIENT_ID,
  clientSecret: env.GITHUB_CLIENT_SECRET,
  // This callback URL needs to be set in Github's UI:
  // http://localhost:3001/auth/login/github/callback,
});

export const googleAuth = google(auth, {
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:3001/auth/login/google/callback",
  scope: ["profile", "email"],
});

export const discordAuth = discord(auth, {
  clientId: env.DISCORD_CLIENT_ID,
  clientSecret: env.DISCORD_CLIENT_SECRET,
  redirectUri: "http://localhost:3001/auth/login/discord/callback",
  scope: ["identify", "email"],
});

export type Auth = typeof auth;
